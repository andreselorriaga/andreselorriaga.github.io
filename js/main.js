// Main JS for the site
document.addEventListener('DOMContentLoaded', function () {
	// Set current year in footer
	try {
		var el = document.getElementById('year');
		if (el) {
			el.textContent = new Date().getFullYear();
		}
	} catch (e) {
		// fail silently
		console.error('Error setting year:', e);
	}

    // Animated per-letter transform for hero title (A/a -> 4, I/i -> 1, E/e -> 3)
    try {
        (function(){
            var heroEls = Array.from(document.querySelectorAll('.hero-title'));
            if(!heroEls.length) return;

            // helper mapping
            function leetChar(ch){
                if(!ch) return ch;
                if(/a/i.test(ch)) return '4';
                if(/i/i.test(ch)) return '1';
                if(/e/i.test(ch)) return '3';
                return ch;
            }

            // animation parameters
            var step  = 220;   // ms entre letras
            var hold  = 360;   // ms letra leet antes de volver
            var pause = 1400;  // pausa entre ciclos
            var between = 1000; // pausa entre distintos hero-titles

            // Inicializa todos los títulos
            var heroData = heroEls.map(function(heroEl){
                if(heroEl.getAttribute('data-animated')) return null;

                var originalTitle = heroEl.getAttribute('data-original') || heroEl.textContent || '';
                heroEl.setAttribute('data-original', originalTitle);
                heroEl.setAttribute('aria-label', originalTitle);
                heroEl.setAttribute('data-animated', '1');

                var chars = Array.from(originalTitle);
                heroEl.innerHTML = ''; // limpiar
                var spans = chars.map(function(c){
                    var span = document.createElement('span');
                    span.className = 'hero-char';
                    span.setAttribute('data-original', c);
                    span.setAttribute('aria-hidden','true');
                    if(c === ' ') {
                        span.textContent = '\u00A0';
                        span.classList.add('hero-space');
                    } else {
                        span.textContent = c;
                    }
                    heroEl.appendChild(span);
                    return span;
                });

                return { el: heroEl, spans: spans };
            }).filter(Boolean);

            // Función que anima un título completo y devuelve su duración total
            function animateTitle(data, onComplete) {
                var spans = data.spans;
                spans.forEach(function(span, i){
                    var orig = span.getAttribute('data-original');
                    if (orig.trim() === '') return;
                    var l = leetChar(orig);

                    setTimeout(function () {
                        span.textContent = l;
                        span.classList.add('leet');
                    }, i * step);

                    setTimeout(function () {
                        span.textContent = orig;
                        span.classList.remove('leet');
                    }, i * step + hold);
                });

                // Duración total del ciclo
                var total = spans.length * step + hold + pause;
                setTimeout(function(){
                    if(typeof onComplete === 'function') onComplete();
                }, total);
            }

            // Reproduce todos los títulos de forma secuencial (en bucle)
            function runSequential(index){
                if(index >= heroData.length) {
                    // volver a empezar
                    setTimeout(function(){ runSequential(0); }, between);
                    return;
                }

                var current = heroData[index];
                animateTitle(current, function(){
                    // pasar al siguiente tras pequeña pausa
                    setTimeout(function(){
                        runSequential(index + 1);
                    }, between);
                });
            }

            // iniciar la secuencia tras un pequeño retardo
            setTimeout(function(){ runSequential(0); }, 800);
        })();
    } catch (err) {
        console.error('Error initializing animated hero title:', err);
    }



	// Other initialization code can go here in the future
	// Cookie consent handling with detailed preferences modal
	(function(){
		var CONSENT_KEY = 'cookie_consent'; // stores JSON: {necessary:true, analytics:bool, marketing:bool}

		function getConsent(){
			try {
				var v = localStorage.getItem(CONSENT_KEY);
				if(!v) return null;
				return JSON.parse(v);
			} catch(e){
				return null;
			}
		}

		function setConsent(obj){
			try { localStorage.setItem(CONSENT_KEY, JSON.stringify(obj)); } catch(e){}
		}

		function applyConsent(obj){
			if(!obj) return;
			// analytics example hook
			if(obj.analytics){
				// initialize analytics scripts here (example placeholder)
				console.log('Analytics enabled');
			} else {
				console.log('Analytics disabled');
			}
			if(obj.marketing){ console.log('Marketing enabled'); } else { console.log('Marketing disabled'); }
		}

		function showBanner(){ document.body.classList.add('show-cookie'); }
		function hideBanner(){ document.body.classList.remove('show-cookie'); }

		function showModal(){
			var modal = document.getElementById('cookie-modal');
			if(!modal) return;
			modal.setAttribute('aria-hidden','false');
			modal.style.display = 'flex';
			// populate checkboxes from stored consent
			var consent = getConsent();
			if(consent){
				document.getElementById('cookie-analytics').checked = !!consent.analytics;
				document.getElementById('cookie-marketing').checked = !!consent.marketing;
			} else {
				// default: unchecked non-essential
				document.getElementById('cookie-analytics').checked = false;
				document.getElementById('cookie-marketing').checked = false;
			}
			// focus first checkbox
			setTimeout(function(){ document.getElementById('cookie-analytics').focus(); }, 100);
		}

		function hideModal(){
			var modal = document.getElementById('cookie-modal');
			if(!modal) return;
			modal.setAttribute('aria-hidden','true');
			modal.style.display = 'none';
		}

		// initialize
		var consent = getConsent();
		if(!consent){ showBanner(); } else { applyConsent(consent); }

		var acceptBtn = document.getElementById('cookie-accept');
		var rejectBtn = document.getElementById('cookie-reject');
		var settingsBtn = document.getElementById('cookie-settings');
		var modalClose = document.getElementById('cookie-modal-close');
		var modalSave = document.getElementById('cookie-save');
		var modalCancel = document.getElementById('cookie-cancel');

		if(acceptBtn) acceptBtn.addEventListener('click', function(){
			var obj = { necessary: true, analytics: true, marketing: true };
			setConsent(obj);
			applyConsent(obj);
			hideBanner();
		});

		if(rejectBtn) rejectBtn.addEventListener('click', function(){
			var obj = { necessary: true, analytics: false, marketing: false };
			setConsent(obj);
			applyConsent(obj);
			hideBanner();
		});

		if(settingsBtn) settingsBtn.addEventListener('click', function(){
			showModal();
		});

		if(modalClose) modalClose.addEventListener('click', function(){ hideModal(); });

		if(modalCancel) modalCancel.addEventListener('click', function(){ hideModal(); });

		if(modalSave) modalSave.addEventListener('click', function(){
			var analytics = !!document.getElementById('cookie-analytics').checked;
			var marketing = !!document.getElementById('cookie-marketing').checked;
			var obj = { necessary: true, analytics: analytics, marketing: marketing };
			setConsent(obj);
			applyConsent(obj);
			hideModal();
			hideBanner();
		});

		// close modal on backdrop click
		var modalEl = document.getElementById('cookie-modal');
		if(modalEl) modalEl.addEventListener('click', function(e){ if(e.target === modalEl) hideModal(); });
	})();
});
