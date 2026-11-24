(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('sectionNav');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.sec > h2, .section-heading, .manifesto h2').forEach(el => observer.observe(el));
  }

  const steps = [
    ['Discover', "A context-ranked idea fits Ravi's existing menu: a ₹99 weekday breakfast combo. Discovery is curated, not autonomous market prediction."],
    ['Explore', 'Ravi asks why it fits, in his preferred language. Contextual AI or explicitly selected Demo Mode explains the idea and its assumptions.'],
    ['Evaluate', 'He checks selling price, making cost, promotion budget and target. The deterministic financial engine calculates; AI explains supplied numbers.'],
    ['Try', 'Ravi confirms a seven-day experiment. The server validates Draft → Approved → Running transitions; AI has no mutation tools.'],
    ['Measure', 'He confirms actual units, promotion spend and observations. Completed results are immutable records, not model-generated outcomes.'],
    ['Learn', 'Stored facts distinguish below-target and above-target outcomes and link a different next opportunity. This is not autonomous model training.']
  ];
  const ring = document.getElementById('loopRing');
  const buttons = steps.map(([title], index) => {
    const angle = index * Math.PI / 3 - Math.PI / 2;
    const button = document.createElement('button');
    button.className = 'lnode';
    button.type = 'button';
    button.textContent = title;
    button.setAttribute('aria-controls', 'stepPanel');
    button.style.left = `${50 + 36 * Math.cos(angle)}%`;
    button.style.top = `${50 + 36 * Math.sin(angle)}%`;
    button.addEventListener('click', () => selectStep(index));
    ring.appendChild(button);
    return button;
  });
  function selectStep(index) {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    document.getElementById('stepN').textContent = `0${index + 1}`;
    document.getElementById('stepT').textContent = steps[index][0];
    document.getElementById('stepD').textContent = steps[index][1];
    document.getElementById('ringProg').style.strokeDashoffset = 942.5 * (1 - (index + 1) / 6);
  }
  selectStep(0);

  const languages = {
    en: ['“Weekday customers are down. Let\'s try a ₹99 breakfast combo.”', 'English', 'en'],
    hinglish: ['“Ravi, weekdays par customers kam aa rahe hain. Chalo ₹99 ka breakfast combo try karte hain.”', 'Hinglish', 'hi-Latn'],
    hi: ['“रवि, weekdays पर customers कम आ रहे हैं। चलिए ₹99 का breakfast combo try करते हैं।”', 'Hindi', 'hi'],
    kn: ['“ರವಿ, weekdays ನಲ್ಲಿ customers ಕಡಿಮೆ ಬರುತ್ತಿದ್ದಾರೆ. ₹99 breakfast combo try ಮಾಡೋಣ.”', 'Kannada', 'kn']
  };
  const languageButtons = document.querySelectorAll('[data-lang]');
  languageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const [quote, name, locale] = languages[button.dataset.lang];
      languageButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      const text = document.getElementById('langQuote');
      text.textContent = quote;
      text.lang = locale;
      const image = document.getElementById('langShot');
      image.src = `assets/home-${button.dataset.lang}-390.webp`;
      image.height = { en: 2144, hinglish: 2104, hi: 2065, kn: 2084 }[button.dataset.lang];
      image.alt = `Actual Udaan prototype home screen in ${name} using synthetic data`;
    });
  });

  // Educational display only. The application's finance.ts remains authoritative.
  const scenarios = {
    70: ['Below target. Explore a smaller visibility test.', '₹2,280 remains after modeled variable costs and promotion. Consider the implemented ₹600 visibility hypothesis. Low awareness is not a proven cause; keep menu and price unchanged while testing.'],
    100: ['On target. Check repeat demand next.', 'The model leaves ₹3,900 after variable costs and promotion. A repeat-customer or controlled-expansion test is a next hypothesis, not proof of lasting growth.'],
    130: ['Above target. Give customers a reason to return.', '₹5,520 remains after modeled variable costs and promotion. Explore repeat-customer testing or controlled expansion with the implemented ₹900 follow-up budget; validate capacity and reward costs first.']
  };
  const scenarioButtons = document.querySelectorAll('[data-units]');
  scenarioButtons.forEach(button => {
    button.addEventListener('click', () => {
      const units = Number(button.dataset.units);
      const contributionPaise = (9900 - 4500) * units - 150000;
      scenarioButtons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      document.getElementById('contribution').textContent = `₹${(contributionPaise / 100).toLocaleString('en-IN')}`;
      document.getElementById('equation').textContent = `(₹99 − ₹45) × ${units} − ₹1,500`;
      document.getElementById('achievement').textContent = `${units}%`;
      document.getElementById('unitBar').style.width = `${units / 130 * 100}%`;
      document.getElementById('outcomeTitle').textContent = scenarios[units][0];
      document.getElementById('outcomeAdvice').textContent = scenarios[units][1];
    });
  });

  const carousel = document.getElementById('carouselTrack');
  const slides = [...carousel.querySelectorAll('figure')];
  const previous = document.getElementById('carouselPrev');
  const next = document.getElementById('carouselNext');
  const status = document.getElementById('carouselStatus');
  let activeSlide = 0;
  let scrollFrame;
  function updateCarousel() {
    const offsets = slides.map(slide => slide.offsetLeft - slides[0].offsetLeft);
    activeSlide = offsets.reduce((nearest, offset, index) =>
      Math.abs(offset - carousel.scrollLeft) < Math.abs(offsets[nearest] - carousel.scrollLeft) ? index : nearest, 0);
    // At desktop widths several cards remain visible at the end of the track.
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 2;
    previous.disabled = carousel.scrollLeft <= 2;
    next.disabled = atEnd;
    status.textContent = atEnd ? 'End of 7 slides' : `Slide ${activeSlide + 1} of 7`;
  }
  function moveCarousel(direction) {
    const index = Math.max(0, Math.min(slides.length - 1, activeSlide + direction));
    carousel.scrollTo({
      left: slides[index].offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion ? 'instant' : 'smooth'
    });
  }
  previous.addEventListener('click', () => moveCarousel(-1));
  next.addEventListener('click', () => moveCarousel(1));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveCarousel(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  carousel.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateCarousel);
  }, { passive: true });
  window.addEventListener('resize', updateCarousel);
  document.querySelector('.carousel-controls').hidden = false;
  updateCarousel();

  const video = document.getElementById('productDemo');
  const showPlaybackError = () => { document.getElementById('videoError').hidden = false; };
  video.addEventListener('error', showPlaybackError);
  video.querySelector('source').addEventListener('error', showPlaybackError);
})();
