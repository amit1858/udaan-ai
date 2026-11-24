"""Private native-console provisioning into temporary Windows Credential Manager."""

import argparse
import ctypes
from ctypes import wintypes
import getpass
import json
import os
from pathlib import Path
import sys
import time
import warnings


class CredentialError(Exception):
    def __init__(self, message, windows_code=None):
        super().__init__(message)
        self.windows_code = windows_code


class PrivateArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        self.exit(2, "Invalid arguments. Never put credentials in command arguments.\n")


class Credential(ctypes.Structure):
    _fields_ = [
        ("Flags", wintypes.DWORD), ("Type", wintypes.DWORD),
        ("TargetName", wintypes.LPWSTR), ("Comment", wintypes.LPWSTR),
        ("LastWritten", wintypes.FILETIME), ("CredentialBlobSize", wintypes.DWORD),
        ("CredentialBlob", ctypes.POINTER(ctypes.c_ubyte)), ("Persist", wintypes.DWORD),
        ("AttributeCount", wintypes.DWORD), ("Attributes", ctypes.c_void_p),
        ("TargetAlias", wintypes.LPWSTR), ("UserName", wintypes.LPWSTR),
    ]


class CredentialUI(ctypes.Structure):
    _fields_ = [
        ("cbSize", wintypes.DWORD), ("hwndParent", wintypes.HWND),
        ("pszMessageText", wintypes.LPCWSTR), ("pszCaptionText", wintypes.LPCWSTR),
        ("hbmBanner", wintypes.HBITMAP),
    ]


def read_native_dialog(target):
    if os.name != "nt":
        raise CredentialError("Windows native credential dialog is required.")
    dll = ctypes.WinDLL("Credui.dll", use_last_error=True)
    dll.CredUIPromptForCredentialsW.argtypes = [
        ctypes.POINTER(CredentialUI), wintypes.LPCWSTR, ctypes.c_void_p, wintypes.DWORD,
        wintypes.LPWSTR, wintypes.ULONG, wintypes.LPWSTR, wintypes.ULONG,
        ctypes.POINTER(wintypes.BOOL), wintypes.DWORD,
    ]
    dll.CredUIPromptForCredentialsW.restype = wintypes.DWORD
    username = ctypes.create_unicode_buffer("udaan-video", 513)
    password = ctypes.create_unicode_buffer(257)
    save = wintypes.BOOL(False)
    info = CredentialUI(
        cbSize=ctypes.sizeof(CredentialUI),
        pszCaptionText="Udaan - paste Gnani API key securely",
        pszMessageText="Paste your Gnani API key into Password (Ctrl+V). Leave username udaan-video unchanged. Do NOT enter your Windows password. No API call is made; temporary encrypted Windows storage only.",
    )
    try:
        result = dll.CredUIPromptForCredentialsW(
            ctypes.byref(info), target, None, 0, username, len(username),
            password, len(password), ctypes.byref(save), 0x40000 | 0x80 | 0x2,
        )
        if result != 0:
            raise CredentialError("Native credential entry failed or was cancelled.", result)
        return password.value
    finally:
        ctypes.memset(password, 0, ctypes.sizeof(password))


def api():
    if os.name != "nt":
        raise CredentialError("Windows native encrypted credential storage is required.")
    dll = ctypes.WinDLL("Advapi32.dll", use_last_error=True)
    pointer = ctypes.POINTER(Credential)
    dll.CredReadW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.POINTER(pointer)]
    dll.CredReadW.restype = wintypes.BOOL
    dll.CredWriteW.argtypes = [pointer, wintypes.DWORD]
    dll.CredWriteW.restype = wintypes.BOOL
    dll.CredDeleteW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD]
    dll.CredDeleteW.restype = wintypes.BOOL
    dll.CredFree.argtypes = [ctypes.c_void_p]
    dll.CredFree.restype = None
    return dll


def read_secret(target):
    dll = api()
    pointer = ctypes.POINTER(Credential)()
    if not dll.CredReadW(target, 1, 0, ctypes.byref(pointer)):
        if ctypes.get_last_error() == 1168:
            return None
        raise CredentialError("Windows credential lookup failed.", ctypes.get_last_error())
    try:
        return ctypes.string_at(pointer.contents.CredentialBlob,
                                pointer.contents.CredentialBlobSize).decode("ascii")
    finally:
        ctypes.memset(pointer.contents.CredentialBlob, 0, pointer.contents.CredentialBlobSize)
        dll.CredFree(pointer)


def store_secret(target, secret):
    dll = api()
    buffer = ctypes.create_string_buffer(secret.encode("ascii"))
    credential = Credential(
        Type=1, TargetName=target,
        Comment="Temporary Udaan Gnani TTS key; delete after approved narration.",
        CredentialBlobSize=len(secret), CredentialBlob=ctypes.cast(buffer, ctypes.POINTER(ctypes.c_ubyte)),
        Persist=1, UserName="udaan-video",
    )
    try:
        if not dll.CredWriteW(ctypes.byref(credential), 0):
            raise CredentialError("Windows encrypted credential storage failed.", ctypes.get_last_error())
    finally:
        ctypes.memset(buffer, 0, ctypes.sizeof(buffer))
        secret = None


def delete_secret(target):
    if not api().CredDeleteW(target, 1, 0) and ctypes.get_last_error() != 1168:
        raise CredentialError("Windows temporary credential deletion failed.", ctypes.get_last_error())


def parse_arguments():
    parser = PrivateArgumentParser(description=__doc__)
    parser.add_argument("--target", required=True)
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--delete", action="store_true")
    parser.add_argument("--dialog", action="store_true")
    parser.add_argument("--replace", action="store_true")
    parser.add_argument("--diagnostics", type=Path,
                        help="New external JSON file containing status/error code only, never the key.")
    args = parser.parse_args()
    if args.diagnostics is not None:
        diagnostic = args.diagnostics.resolve()
        repository = Path(__file__).resolve().parents[3]
        if diagnostic.suffix != ".json" or diagnostic.exists() \
                or diagnostic == repository or repository in diagnostic.parents:
            raise CredentialError("Diagnostic output must be a new external JSON file.")
    return args


def main(args):
    if not args.target.startswith("udaan-product-demo-video:"):
        raise CredentialError("Use this project's uniquely scoped credential target.")
    if args.delete:
        delete_secret(args.target)
        print("Temporary Windows credential removed.")
        return "deleted"
    existing = read_secret(args.target)
    if args.status:
        status = "configured" if existing is not None else "not-configured"
        print(status)
        existing = None
        return status
    if existing is not None and not args.replace:
        existing = None
        raise CredentialError("This target is already configured; it will not be overwritten.")
    existing = None
    if not args.dialog and (not sys.stdin.isatty() or not sys.stderr.isatty()):
        raise CredentialError("A separate interactive native Windows console is required.")
    print("UDAAN - PRIVATE GNANI KEY ENTRY")
    print("Enter the key here only. No key is printed or written to a key/.env file.")
    print("It is stored temporarily in Windows Credential Manager for this logon session.")
    key = None
    try:
        if args.dialog:
            key = read_native_dialog(args.target)
        else:
            with warnings.catch_warnings():
                warnings.simplefilter("error", getpass.GetPassWarning)
                key = getpass.getpass("Gnani API key (input will not echo): ")
        if not key or any(ord(char) < 33 or ord(char) > 126 for char in key):
            raise CredentialError("Invalid nonempty ASCII header value; key was not stored.")
        store_secret(args.target, key)
        print("Key configured in encrypted Windows storage. No API call has been made.")
        print("This window will close. The approved workflow can now continue.")
        time.sleep(5)
    finally:
        key = None
    return "configured"


def diagnostic_result(args, status, error=None):
    if args is None or args.diagnostics is None:
        return True
    result = {"status": status, "api_requests": 0, "key_logged": False}
    if error is not None:
        result["reason"] = str(error) if isinstance(error, CredentialError) \
            else "Input or local operation failed; sensitive details suppressed."
        result["windows_error_code"] = error.windows_code if isinstance(error, CredentialError) else None
    try:
        with args.diagnostics.open("x", encoding="utf-8") as output:
            json.dump(result, output, indent=2)
            output.write("\n")
    except OSError:
        print("Nonsecret diagnostic report could not be written; details suppressed.", file=sys.stderr)
        return False
    return True


if __name__ == "__main__":
    arguments = None
    try:
        arguments = parse_arguments()
        status = main(arguments)
    except (CredentialError, getpass.GetPassWarning, EOFError, KeyboardInterrupt, UnicodeError, OSError) as error:
        diagnostic_result(arguments, "failed", error)
        print("Secure key setup failed or was cancelled; sensitive details suppressed.", file=sys.stderr)
        time.sleep(5)
        raise SystemExit(1)
    else:
        if not diagnostic_result(arguments, status):
            raise SystemExit(1)
