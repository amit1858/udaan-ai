param(
    [Parameter(Mandatory = $true)][string]$Audio,
    [Parameter(Mandatory = $true)][string]$Script,
    [Parameter(Mandatory = $true)][string]$Output,
    [ValidateSet('dictation', 'forced', 'vocabulary')][string]$Mode = 'dictation'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0
if (Test-Path -LiteralPath $Output) { throw 'Alignment output must be new.' }
Add-Type -AssemblyName System.Speech
$recognizer = [System.Speech.Recognition.SpeechRecognitionEngine]::InstalledRecognizers() |
    Where-Object { $_.Id -eq 'MS-2057-80-DESK' } | Select-Object -First 1
if (-not $recognizer) { throw 'The installed offline Microsoft en-GB recognizer is required.' }
$text = (Get-Content -LiteralPath $Script -Raw).Trim()
$normalized = [regex]::Replace($text.Replace('-', ' '), '[^A-Za-z0-9''\s]', ' ')
$normalized = [regex]::Replace($normalized, '\s+', ' ').Trim()
$builder = New-Object System.Speech.Recognition.GrammarBuilder
$builder.Culture = $recognizer.Culture
$builder.Append($normalized)
$grammar = if ($Mode -eq 'vocabulary') {
    $choices = New-Object System.Speech.Recognition.Choices([string[]]$normalized.Split(' '))
    $vocabulary = New-Object System.Speech.Recognition.GrammarBuilder
    $vocabulary.Culture = $recognizer.Culture
    $vocabulary.Append($choices, 1, 250)
    New-Object System.Speech.Recognition.Grammar($vocabulary)
} elseif ($Mode -eq 'forced') {
    New-Object System.Speech.Recognition.Grammar($builder)
} else {
    New-Object System.Speech.Recognition.DictationGrammar
}
$engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine($recognizer)
try {
    $timeout = if ($Mode -eq 'forced') { 2 } else { 0.3 }
    $engine.EndSilenceTimeout = [TimeSpan]::FromSeconds($timeout)
    $engine.EndSilenceTimeoutAmbiguous = [TimeSpan]::FromSeconds($timeout)
    $engine.InitialSilenceTimeout = [TimeSpan]::FromSeconds(2)
    $engine.LoadGrammar($grammar)
    $engine.SetInputToWaveFile((Resolve-Path -LiteralPath $Audio).Path)
    $words = @()
    $confidences = @()
    $phrases = @()
    while ($null -ne ($result = $engine.Recognize())) {
        $origin = $result.Audio.AudioPosition.TotalSeconds
        $phrases += @{
            start = $origin
            end = $origin + $result.Audio.Duration.TotalSeconds
            confidence = $result.Confidence
            text = $result.Text
            audio_start_time = $result.Audio.StartTime.ToString('o')
            recognizer_position = $engine.RecognizerAudioPosition.TotalSeconds
            input_position = $engine.AudioPosition.TotalSeconds
        }
        $confidences += $result.Confidence
        $words += @($result.Words | ForEach-Object {
            $range = $result.GetAudioForWordRange($_, $_)
            @{
                text = $_.Text
                lexical = $_.LexicalForm
                start = [math]::Round($origin + $range.AudioPosition.TotalSeconds, 5)
                end = [math]::Round($origin + $range.AudioPosition.TotalSeconds + $range.Duration.TotalSeconds, 5)
                confidence = [math]::Round($_.Confidence, 5)
            }
        })
        if ($null -eq $engine.AudioFormat) { break }
    }
    if (-not $words.Count) { throw 'Offline recognition returned no words.' }
    if (($words | Where-Object { $_.end -gt $_.start }).Count -ne $words.Count) {
        throw 'The installed recognizer returned invalid word audio ranges.'
    }
    if ($Mode -eq 'forced' -and $words.Count -ne $normalized.Split(' ').Count) {
        throw 'Recognized word count differs from the normalized approved script.'
    }
    $report = @{
        status = 'offline-' + $Mode
        recognizer = $recognizer.Id
        culture = $recognizer.Culture.Name
        audio_sha256 = (Get-FileHash -LiteralPath $Audio -Algorithm SHA256).Hash.ToLowerInvariant()
        script_sha256 = (Get-FileHash -LiteralPath $Script -Algorithm SHA256).Hash.ToLowerInvariant()
        confidence = [math]::Round(($confidences | Measure-Object -Average).Average, 5)
        words = $words
        phrases = $phrases
        transcript_verified = $false
        word_position_scope = 'relative to recognition phrase; native absolute stream position unavailable'
        network_requests = 0
        microphone_used = $false
    }
    $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $Output -Encoding UTF8
    Write-Output ('Offline recognized words: ' + $words.Count + '; confidence: ' + $report.confidence)
} finally {
    $engine.Dispose()
}
