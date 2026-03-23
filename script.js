document.addEventListener("DOMContentLoaded", () => {
  // === FUNÇÕES DE UI E ANIMAÇÕES (MANTIDAS INTACTAS) ===
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const progressBar = document.getElementById("progressBar");
  const backToTop = document.getElementById("backToTop");
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const copyFeedback = document.getElementById("copyFeedback");
  const magneticButtons = document.querySelectorAll(".magnetic");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
  }

  window.addEventListener("scroll", () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + "%";
    if (backToTop) backToTop.style.display = scrollTop > 400 ? "block" : "none";
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        if (entry.target.hasAttribute("data-counter") && !entry.target.dataset.started) {
          animateCounter(entry.target);
          entry.target.dataset.started = "true";
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function rebindUI() {
    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
    document.querySelectorAll("[data-counter]").forEach((c) => revealObserver.observe(c));
    
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener("mouseleave", () => card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)");
    });

    document.querySelectorAll(".tab-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-tab");
        const tabsWrapper = button.closest(".tabs");
        if (!tabsWrapper) return;
        tabsWrapper.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
        tabsWrapper.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
        button.classList.add("active");
        const targetContent = tabsWrapper.querySelector(`#${targetId}`);
        if (targetContent) targetContent.classList.add("active");
      });
    });

    document.querySelectorAll(".accordion-header").forEach((header) => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        const accordion = item.parentElement;
        accordion.querySelectorAll(".accordion-item").forEach((accItem) => {
          if (accItem !== item) accItem.classList.remove("active");
        });
        item.classList.toggle("active");
      });
    });
  }

  function animateCounter(element) {
    const target = parseInt(element.getAttribute("data-counter"), 10);
    let current = 0;
    const increment = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      element.textContent = current;
    }, 35);
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyEmailBtn.getAttribute("data-email"));
        if (copyFeedback) copyFeedback.textContent = "E-mail copiado com sucesso.";
      } catch (error) {
        if (copyFeedback) copyFeedback.textContent = "Não foi possível copiar o e-mail.";
      }
    });
  }

  magneticButtons.forEach((button) => {
    button.addEventListener("mousemove", (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    button.addEventListener("mouseleave", () => button.style.transform = "translate(0, 0)");
  });

  // === INTEGRAÇÃO DE DADOS (CMS) ===
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  const setEl = (id, val, isImg = false) => {
      const el = document.getElementById(id);
      if(el && val) { isImg ? el.src = val : el.innerText = val; }
  };
  const setHtml = (id, val) => { const el = document.getElementById(id); if(el && val) el.innerHTML = val; };

  if (currentPage === 'index.html' || currentPage === '') {
      fetch('conteudo_home.json').then(r => r.json()).then(data => {
          if(data.hero) {
              setEl('hero-bg', data.hero.bg_image, true);
              setEl('hero-eyebrow', data.hero.eyebrow);
              setEl('hero-title', data.hero.title);
              setEl('hero-text', data.hero.text);
          }
          if(data.quem_somos) {
              setEl('qs-tag', data.quem_somos.tag);
              setEl('qs-title', data.quem_somos.title);
              setEl('qs-text1', data.quem_somos.text1);
              setEl('qs-text2', data.quem_somos.text2);
              if(data.quem_somos.cards) {
                  setHtml('qs-cards', data.quem_somos.cards.map(c => `<article class="glass-card tilt-card"><h3>${c.title}</h3><p>${c.text}</p></article>`).join(''));
              }
          }
          if(data.pilares) {
              setEl('pilares-tag', data.pilares.tag);
              setEl('pilares-title', data.pilares.title);
              if(data.pilares.items) {
                  setHtml('pilares-items', data.pilares.items.map(i => `<article class="feature-card reveal tilt-card"><div class="feature-number" data-counter="${i.number}">0</div><h3>${i.title}</h3><p>${i.text}</p></article>`).join(''));
              }
          }
          if(data.cta) {
              setEl('cta-tag', data.cta.tag);
              setEl('cta-title', data.cta.title);
              setEl('cta-text', data.cta.text);
          }
          rebindUI();
      }).catch(e => console.log(e));
  }

  else if (currentPage === 'private-label.html') {
      fetch('conteudo_privatelabel.json').then(r => r.json()).then(data => {
          if(data.hero) {
              setEl('hero-bg', data.hero.bg_image, true); setEl('hero-eyebrow', data.hero.eyebrow);
              setEl('hero-title', data.hero.title); setEl('hero-text', data.hero.text);
          }
          if(data.solucao) {
              setEl('sol-title', data.solucao.title); setEl('sol-text1', data.solucao.text1); setEl('sol-text2', data.solucao.text2);
              if(data.solucao.timeline) setHtml('sol-timeline', data.solucao.timeline.map(t => `<div class="timeline-item"><span>${t.num}</span><div><h3>${t.title}</h3><p>${t.text}</p></div></div>`).join(''));
          }
          if(data.diferenciais) {
              setEl('dif-tag', data.diferenciais.tag); setEl('dif-title', data.diferenciais.title);
              if(data.diferenciais.features) setHtml('dif-features', data.diferenciais.features.map(f => `<article class="feature-card reveal tilt-card"><h3>${f.title}</h3><p>${f.text}</p></article>`).join(''));
          }
          if(data.cta) { setEl('cta-tag', data.cta.tag); setEl('cta-title', data.cta.title); }
          rebindUI();
      }).catch(e => console.log(e));
  }

  else if (currentPage === 'sourcing.html') {
      fetch('conteudo_sourcing.json').then(r => r.json()).then(data => {
          if(data.hero) { setEl('hero-bg', data.hero.bg_image, true); setEl('hero-eyebrow', data.hero.eyebrow); setEl('hero-title', data.hero.title); setEl('hero-text', data.hero.text); }
          if(data.conexao) {
              setEl('con-title', data.conexao.title); setEl('con-text', data.conexao.text);
              if(data.conexao.accordion) setHtml('con-accordion', data.conexao.accordion.map((a, i) => `<div class="accordion-item ${i===0?'active':''}"><button class="accordion-header">${a.title}</button><div class="accordion-body"><p>${a.text}</p></div></div>`).join(''));
          }
          if(data.features && data.features.items) setHtml('src-features', data.features.items.map(f => `<article class="feature-card reveal tilt-card"><h3>${f.title}</h3><p>${f.text}</p></article>`).join(''));
          rebindUI();
      }).catch(e => console.log(e));
  }

  else if (currentPage === 'portfolio.html') {
      fetch('conteudo_portfolio.json').then(r => r.json()).then(data => {
          if(data.hero) { setEl('hero-bg', data.hero.bg_image, true); setEl('hero-eyebrow', data.hero.eyebrow); setEl('hero-title', data.hero.title); setEl('hero-text', data.hero.text); }
          if(data.produtos) setHtml('port-produtos', data.produtos.map(p => `<article class="glass-card reveal tilt-card"><h3>${p.title}</h3><p>${p.text}</p></article>`).join(''));
          if(data.destaques) {
              setEl('dest-tag', data.destaques.tag); setEl('dest-title', data.destaques.title);
              if(data.destaques.features) setHtml('dest-features', data.destaques.features.map(f => `<article class="feature-card reveal tilt-card"><h3>${f.title}</h3><p>${f.text}</p></article>`).join(''));
          }
          rebindUI();
      }).catch(e => console.log(e));
  }

  else if (currentPage === 'sc-beautycare.html') {
      fetch('conteudo_scbeautycare.json').then(r => r.json()).then(data => {
          if(data.hero) { setEl('hero-bg', data.hero.bg_image, true); setEl('hero-eyebrow', data.hero.eyebrow); setEl('hero-title', data.hero.title); setEl('hero-text', data.hero.text); }
          if(data.descricao) { setEl('desc-tag', data.descricao.tag); setEl('desc-title', data.descricao.title); setEl('desc-text', data.descricao.text); }
          if(data.tabs) {
              let btns = '', contents = '';
              data.tabs.forEach((t, i) => {
                  let active = i === 0 ? 'active' : '';
                  btns += `<button class="tab-btn ${active}" data-tab="tab${i}">${t.label}</button>`;
                  contents += `<div class="tab-content ${active}" id="tab${i}"><div class="tab-card"><h3>${t.title}</h3><p>${t.text}</p></div></div>`;
              });
              setHtml('sc-tab-btns', btns); setHtml('sc-tab-contents', contents);
          }
          if(data.features && data.features.items) setHtml('sc-features', data.features.items.map(f => `<article class="feature-card reveal tilt-card"><h3>${f.title}</h3><p>${f.text}</p></article>`).join(''));
          rebindUI();
      }).catch(e => console.log(e));
  }

  else if (currentPage === 'contato.html') {
      fetch('conteudo_contato.json').then(r => r.json()).then(data => {
          if(data.hero) { setEl('hero-bg', data.hero.bg_image, true); setEl('hero-eyebrow', data.hero.eyebrow); setEl('hero-title', data.hero.title); setEl('hero-text', data.hero.text); }
          if(data.atendimento) {
              setEl('att-tag', data.atendimento.tag); setEl('att-title', data.atendimento.title);
              setHtml('att-email', `<a href="mailto:${data.atendimento.email}">${data.atendimento.email}</a>`);
              setEl('att-areas', data.atendimento.areas);
          }
          rebindUI();
      }).catch(e => console.log(e));
  } else {
    rebindUI();
  }
});