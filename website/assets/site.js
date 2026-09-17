/* ============================================================================
   Berlinando — kleines Seiten-Skript (ohne Framework, ohne externe Dienste)
   ----------------------------------------------------------------------------
   Ersetzt die React-Logik aus dem Claude-Design-Export. Jeder Baustein prüft
   selbst, ob es seine Elemente auf der aktuellen Seite gibt — deshalb können
   alle Seiten dieselbe Datei laden.

   1. Startseite: Titelfoto-Parallaxe, Schatten + Logo-Größe der Navigation
   2. Startseite: Einblenden beim Scrollen (.reveal)
   3. Startseite: Sprungmarken (#kontakt) mit Abstand zur festen Navigation
   4. Startseite: Tour-Gruppen & Tour-Zeilen aufklappen (.gx / .trowx)
   5. Startseite: Bewertungs-Karussell (.qrow)
   6. Tourseiten: Akkordeons (.acc)
   7. Katalog: Filter & „ver detalhe"
   Ohne JavaScript bleibt jede Seite lesbar (nur die Aufklapp-Bereiche bleiben zu).
   ========================================================================== */
(function () {
  'use strict';

  var weicheBewegung = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Hilfen fürs Auf-/Zuklappen (max-height-Animation) ------------------- */
  // Endzustand ohne Animation festschreiben
  function festsetzen(pan, wert) {
    pan.style.transition = 'none';
    pan.style.maxHeight = wert;
    void pan.offsetHeight;
    pan.style.transition = '';
  }
  function oeffnen(pan, dauer) {
    if (!pan) return;
    var inner = pan.firstElementChild;
    clearTimeout(pan._t);
    pan.style.maxHeight = (inner ? inner.scrollHeight : 0) + 'px';
    // Danach Begrenzung lösen, damit verschachtelte Bereiche wachsen dürfen
    pan._t = setTimeout(function () { festsetzen(pan, 'none'); }, dauer);
  }
  function schliessen(pan, dauer) {
    if (!pan) return;
    var inner = pan.firstElementChild;
    clearTimeout(pan._t);
    if (pan.style.maxHeight === 'none' || pan.style.maxHeight === '') {
      pan.style.maxHeight = (inner ? inner.scrollHeight : 0) + 'px';
      void pan.offsetHeight;
    }
    pan._t = setTimeout(function () {
      pan.style.maxHeight = '0px';
      pan._t = setTimeout(function () { festsetzen(pan, '0px'); }, dauer);
    }, 20);
  }

  /* --- 1. Titelfoto & Navigation (Startseite) ------------------------------ */
  var hero = document.getElementById('top');
  var nav = document.querySelector('nav');
  var heroBild = document.querySelector('.herophoto img');
  var fotoBand = document.querySelector('.herophoto');
  var navSchatten = nav && nav.firstElementChild;
  var navLogo = document.getElementById('nav-logo');

  if (hero && heroBild && fotoBand && nav) {
    var wartet = false;
    var aktualisieren = function () {
      wartet = false;
      var h = hero.offsetHeight || 600;
      var y = window.scrollY;
      var hp = Math.min(1, Math.max(0, y / h));
      // Foto läuft langsamer als die Seite (30 % Überhang als Reserve)
      if (weicheBewegung) {
        heroBild.style.transform = 'translate3d(0, -' + (0.0233 * hp * h).toFixed(2) + 'px, 0)';
      }
      // Schatten unter der Navigation, sobald gescrollt wird
      if (navSchatten) {
        navSchatten.style.boxShadow = '0 1px 0 #E7DFCB, 0 8px 22px -8px rgba(51,48,43,' +
          (Math.min(1, hp * 12) * 0.55).toFixed(2) + ')';
      }
      // Logo schrumpft von 58 auf 40 px, während das Foto-Band nach oben verschwindet
      if (navLogo) {
        var t = Math.max(1, fotoBand.offsetTop - nav.getBoundingClientRect().height);
        var ph = fotoBand.offsetHeight;
        var lp = Math.min(1, Math.max(0, (y - t - ph / 3) / Math.max(1, ph * 2 / 3)));
        navLogo.style.height = Math.round(58 - 18 * lp) + 'px';
      }
    };
    var anstossen = function () {
      if (wartet) return;
      wartet = true;
      requestAnimationFrame(aktualisieren);
    };
    window.addEventListener('scroll', anstossen, { passive: true });
    window.addEventListener('resize', anstossen);
    aktualisieren();
  }

  /* --- 2. Einblenden beim Scrollen ----------------------------------------- */
  // Erst nach dem ersten echten Scrollen scharf schalten: Was schon sichtbar ist,
  // bleibt sichtbar; nur Elemente weiter unten blenden beim Erreichen ein.
  var einblendbar = document.querySelectorAll('.reveal');
  if (einblendbar.length && 'IntersectionObserver' in window && weicheBewegung) {
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          beobachter.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

    var scharfschalten = function () {
      var vh = window.innerHeight || 800;
      einblendbar.forEach(function (el) {
        if (el.getBoundingClientRect().top >= vh * 0.94) {
          el.classList.add('is-pre');
          beobachter.observe(el);
        }
      });
    };
    window.addEventListener('scroll', scharfschalten, { passive: true, once: true });
  }

  /* --- 3. Sprungmarken mit Abstand zur festen Navigation ------------------- */
  if (nav && getComputedStyle(nav).position === 'fixed') {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var ziel = id && document.getElementById(id);
      if (!ziel) return;
      e.preventDefault();
      var abstand = id === 'top' ? 0 : nav.getBoundingClientRect().height + 14;
      var oben = id === 'top' ? 0 : ziel.getBoundingClientRect().top + window.scrollY - abstand;
      window.scrollTo({ top: Math.max(0, oben), behavior: 'auto' });
      history.replaceState(null, '', '#' + id);
    });
  }

  /* --- 4. Tour-Gruppen & Tour-Zeilen (Startseite) -------------------------- */
  function alleZeilenSchliessen() {
    document.querySelectorAll('.trowx.is-open').forEach(function (r) {
      r.classList.remove('is-open');
      var b = r.querySelector('.trow');
      if (b) b.setAttribute('aria-expanded', 'false');
      schliessen(r.querySelector('.tpan'), 620);
    });
  }
  function zeileOeffnen(row) {
    row.classList.add('is-open');
    var b = row.querySelector('.trow');
    if (b) b.setAttribute('aria-expanded', 'true');
    oeffnen(row.querySelector('.tpan'), 600);
  }

  document.querySelectorAll('.gx > .grow').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var grp = btn.closest('.gx');
      var auf = !grp.classList.contains('is-open');
      grp.classList.toggle('is-open', auf);
      btn.setAttribute('aria-expanded', auf ? 'true' : 'false');
      var pan = grp.querySelector('.gpan');
      if (auf) {
        // Erste Tour der Rubrik gleich mitöffnen: ein Klick, erster Inhalt sichtbar
        var erste = grp.querySelector('.trowx');
        if (erste && !grp.querySelector('.trowx.is-open')) {
          alleZeilenSchliessen();
          zeileOeffnen(erste);
        }
        oeffnen(pan, 600);
      } else {
        schliessen(pan, 620);
      }
    });
  });

  document.querySelectorAll('.trowx > .trow').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var row = btn.closest('.trowx');
      var warOffen = row.classList.contains('is-open');
      alleZeilenSchliessen();
      if (!warOffen) zeileOeffnen(row);
      // Umgebende Gruppe darf nicht abschneiden
      var grp = row.closest('.gx.is-open');
      if (grp) oeffnen(grp.querySelector('.gpan'), 600);
    });
  });

  /* --- 5. Bewertungs-Karussell (Startseite) -------------------------------- */
  var reihe = document.querySelector('.qrow');
  if (reihe) {
    var knoepfe = document.querySelectorAll('.qbtn');
    var zurueck = knoepfe[0];
    var weiter = knoepfe[1];
    var pfeileAktualisieren = function () {
      if (zurueck) zurueck.disabled = reihe.scrollLeft < 8;
      if (weiter) weiter.disabled = reihe.scrollLeft > reihe.scrollWidth - reihe.clientWidth - 8;
    };
    reihe.addEventListener('scroll', pfeileAktualisieren, { passive: true });
    window.addEventListener('resize', pfeileAktualisieren);
    if (zurueck) zurueck.addEventListener('click', function () {
      reihe.scrollBy({ left: -404, behavior: weicheBewegung ? 'smooth' : 'auto' });
    });
    if (weiter) weiter.addEventListener('click', function () {
      reihe.scrollBy({ left: 404, behavior: weicheBewegung ? 'smooth' : 'auto' });
    });
    pfeileAktualisieren();
  }

  /* --- 6. Akkordeons (Tourseiten) ------------------------------------------ */
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var acc = btn.closest('.acc');
      if (!acc) return;
      var pan = acc.querySelector('.acc-pan');
      var auf = !acc.classList.contains('is-open');
      acc.classList.toggle('is-open', auf);
      btn.setAttribute('aria-expanded', auf ? 'true' : 'false');
      if (!pan) return;
      if (auf) {
        oeffnen(pan, 560);
        // Ein verschachteltes Akkordeon darf sein Elternteil nicht sprengen
        var aussen = acc.parentElement && acc.parentElement.closest('.acc.is-open');
        var ap = aussen && aussen.querySelector('.acc-pan');
        if (ap) { clearTimeout(ap._t); ap.style.maxHeight = 'none'; }
      } else {
        schliessen(pan, 580);
      }
    });
  });

  /* --- 7. Katalog: Filter & Details ---------------------------------------- */
  var katalog = document.querySelector('[data-cat-root]');
  if (katalog) {
    var filter = Array.prototype.slice.call(katalog.querySelectorAll('.filter'));
    var karten = Array.prototype.slice.call(katalog.querySelectorAll('.card'));
    var gruppen = Array.prototype.slice.call(katalog.querySelectorAll('[data-group]'));

    filter.forEach(function (b) {
      b.addEventListener('click', function () {
        filter.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var f = b.getAttribute('data-filter');
        karten.forEach(function (c) {
          var zeigen = f === 'all' || c.getAttribute('data-family') === f || c.getAttribute('data-dur') === f;
          c.classList.toggle('hidden', !zeigen);
        });
        gruppen.forEach(function (g) {
          var sichtbar = Array.prototype.some.call(g.querySelectorAll('.card'), function (c) {
            return !c.classList.contains('hidden');
          });
          g.classList.toggle('hidden', !sichtbar);
        });
      });
    });

    katalog.querySelectorAll('.toggle').forEach(function (tg) {
      tg.addEventListener('click', function () {
        var mehr = tg.closest('.card').querySelector('.more');
        var offen = !mehr.classList.contains('hidden');
        mehr.classList.toggle('hidden', offen);
        tg.textContent = offen ? 'ver detalhe ▾' : 'fechar ▴';
      });
    });
  }
})();
