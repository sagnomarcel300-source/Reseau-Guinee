document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const registrationForm = document.getElementById('registration-form');
    const workerGrid = document.getElementById('worker-grid');

    if (contactForm) {
        const successMessage = document.querySelector('.success-message');
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            successMessage.classList.remove('hidden');
            contactForm.reset();
        });
    }

    if (registrationForm) {
        const successMessage = document.querySelector('.success-message');
        const photoInput = document.getElementById('photo');
        const photoPreview = document.getElementById('photo-preview');
        const portfolioInput = document.getElementById('portfolio');
        const portfolioPreview = document.getElementById('portfolio-preview');

        photoInput.addEventListener('change', function() {
            const file = photoInput.files[0];
            if (file && file.type.startsWith('image/')) {
                readImageFile(file).then((dataUrl) => {
                    photoPreview.src = dataUrl;
                    photoPreview.classList.remove('hidden');
                });
            } else {
                photoPreview.src = '';
                photoPreview.classList.add('hidden');
            }
        });

        portfolioInput.addEventListener('change', function() {
            const files = Array.from(portfolioInput.files).filter((file) => file.type.startsWith('image/')).slice(0, 3);
            if (files.length) {
                readImageFiles(files).then((dataUrls) => {
                    portfolioPreview.innerHTML = dataUrls.map((url) => `<img src="${url}" alt="Aperçu chantier" />`).join('');
                    portfolioPreview.classList.remove('hidden');
                }).catch(() => {
                    portfolioPreview.innerHTML = '';
                    portfolioPreview.classList.add('hidden');
                });
            } else {
                portfolioPreview.innerHTML = '';
                portfolioPreview.classList.add('hidden');
            }
        });

        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const photoFile = photoInput.files[0];
            const portfolioFiles = Array.from(portfolioInput.files).filter((file) => file.type.startsWith('image/')).slice(0, 3);
            const formValues = {
                id: Date.now().toString(),
                nom: registrationForm.name.value.trim(),
                metier: registrationForm.metier.value,
                region: registrationForm.region.value,
                prefecture: registrationForm.prefecture.value,
                commune: registrationForm.commune.value.trim(),
                telephone: registrationForm.telephone.value.trim(),
                competances: registrationForm.competences.value.trim(),
                experience: registrationForm.experience.value.trim(),
                portfolio: [],
            };

            const saveAndReset = function(photoData, portfolioData) {
                saveWorker({...formValues, photo: photoData || '', portfolio: portfolioData || [] });
                registrationForm.reset();
                photoPreview.src = '';
                photoPreview.classList.add('hidden');
                portfolioPreview.innerHTML = '';
                portfolioPreview.classList.add('hidden');
                successMessage.classList.remove('hidden');
            };

            const saveWorkerData = function(photoData) {
                if (portfolioFiles.length) {
                    readImageFiles(portfolioFiles).then((portfolioData) => saveAndReset(photoData, portfolioData)).catch(() => saveAndReset(photoData, []));
                } else {
                    saveAndReset(photoData, []);
                }
            };

            if (photoFile && photoFile.type.startsWith('image/')) {
                readImageFile(photoFile).then(saveWorkerData).catch(() => saveWorkerData(''));
            } else {
                saveWorkerData('');
            }
        });
    }

    const clientForm = document.getElementById('client-form');
    if (clientForm) {
        const clientSuccessMessage = clientForm.querySelector('.client-success');
        const clientHistory = document.getElementById('client-history');
        const clientHistoryText = document.getElementById('client-history-text');
        const clientReset = document.getElementById('client-reset');

        clientForm.addEventListener('submit', function(event) {
            event.preventDefault();
            applyClientSearch();
            clientSuccessMessage.classList.remove('hidden');
            clientHistoryText.textContent = buildClientSummary();
            clientHistory.classList.remove('hidden');
        });

        clientReset.addEventListener('click', function() {
            clientForm.reset();
            document.getElementById('search-input').value = '';
            document.getElementById('metier-filter').value = '';
            document.getElementById('region-filter').value = '';
            document.getElementById('prefecture-filter').value = '';
            document.getElementById('commune-filter').value = '';
            filterWorkers();
            clientSuccessMessage.classList.add('hidden');
            clientHistory.classList.add('hidden');
            clientHistoryText.textContent = '';
        });
    }

    if (workerGrid) {
        initWorkerDirectory();
    }
});

function applyClientSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.value = document.getElementById('client-details').value.trim();
    document.getElementById('metier-filter').value = document.getElementById('client-metier').value;
    document.getElementById('region-filter').value = document.getElementById('client-region').value;
    document.getElementById('prefecture-filter').value = document.getElementById('client-prefecture').value;
    document.getElementById('commune-filter').value = document.getElementById('client-commune').value.trim();
    filterWorkers();
}

function buildClientSummary() {
    const name = document.getElementById('client-name').value.trim();
    const metier = document.getElementById('client-metier').value || 'tout métier';
    const region = document.getElementById('client-region').value || 'toute région';
    const prefecture = document.getElementById('client-prefecture').value || 'toute préfecture';
    const commune = document.getElementById('client-commune').value.trim() || 'toute commune';
    const details = document.getElementById('client-details').value.trim() || 'sans détails supplémentaires';
    return `${name} recherche ${metier} dans ${region} / ${prefecture}, ${commune}. Besoin : ${details}.`;
}

const STORAGE_KEY = 'reseaux-guinee-ouvriers';

function getDefaultWorkers() {
    return [{
            id: '1',
            nom: 'Ali Sylla',
            metier: 'Électricien',
            region: 'Conakry',
            prefecture: 'Conakry',
            commune: 'Kaloum',
            telephone: '622123456',
            competances: 'Installation électrique, dépannage, maintenance',
            experience: '6 ans d’expérience sur les installations domestiques et commerciales.',
            photo: 'https://source.unsplash.com/featured/200x200/?electrician,worker',
            portfolio: [
                'https://source.unsplash.com/featured/400x280/?electrician,tools',
                'https://source.unsplash.com/featured/400x280/?electrical,installation',
                'https://source.unsplash.com/featured/400x280/?electrician,project',
            ],
        },
        {
            id: '2',
            nom: 'Moussa Bah',
            metier: 'Plombier',
            region: 'Labé',
            prefecture: 'Labé',
            commune: 'Labé centre',
            telephone: '622987654',
            competances: 'Plomberie, soudure, réparation de fuites',
            experience: '5 ans dans le bâtiment avec plusieurs chantiers terminés.',
            photo: 'https://source.unsplash.com/featured/200x200/?plumber,repair',
            portfolio: [
                'https://source.unsplash.com/featured/400x280/?plumbing,repair',
                'https://source.unsplash.com/featured/400x280/?plumber,work',
                'https://source.unsplash.com/featured/400x280/?pipe,installation',
            ],
        },
        {
            id: '3',
            nom: 'Aissatou Camara',
            metier: 'Peintre',
            region: 'Kindia',
            prefecture: 'Kindia',
            commune: 'Kindia ville',
            telephone: '622555667',
            competances: 'Peinture intérieure et extérieure, préparation des surfaces',
            experience: '4 ans d’expérience en rénovation de logements.',
            photo: 'https://source.unsplash.com/featured/200x200/?painter,studio',
            portfolio: [
                'https://source.unsplash.com/featured/400x280/?painting,interior',
                'https://source.unsplash.com/featured/400x280/?house,painting',
                'https://source.unsplash.com/featured/400x280/?paint,project',
            ],
        },
    ];

}

function getStoredWorkers() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value ? JSON.parse(value) : [];
    } catch (error) {
        return [];
    }
}

function saveWorker(worker) {
    const stored = getStoredWorkers();
    stored.push(worker);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function initWorkerDirectory() {
    const searchInput = document.getElementById('search-input');
    const metierFilter = document.getElementById('metier-filter');
    const regionFilter = document.getElementById('region-filter');
    const prefectureFilter = document.getElementById('prefecture-filter');
    const communeFilter = document.getElementById('commune-filter');
    const workers = getAllWorkers();

    populateFilterOptions(workers, metierFilter, 'metier');
    populateFilterOptions(workers, regionFilter, 'region');
    populateFilterOptions(workers, prefectureFilter, 'prefecture');
    populateFilterOptions(workers, communeFilter, 'commune');
    renderWorkers(workers);

    [searchInput, metierFilter, regionFilter, prefectureFilter, communeFilter].forEach((element) => {
        element.addEventListener('input', filterWorkers);
    });
}

function getAllWorkers() {
    return [...getStoredWorkers(), ...getDefaultWorkers()];
}

function populateFilterOptions(workers, element, field) {
    const values = Array.from(new Set(workers.map((worker) => worker[field]).filter(Boolean))).sort();
    values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        element.appendChild(option);
    });
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function filterWorkers() {
    const searchValue = normalizeText(document.getElementById('search-input').value);
    const metierValue = document.getElementById('metier-filter').value;
    const regionValue = document.getElementById('region-filter').value;
    const prefectureValue = document.getElementById('prefecture-filter').value;
    const communeValue = document.getElementById('commune-filter').value;
    const workers = getAllWorkers();

    const filtered = workers.filter((worker) => {
        const text = [worker.nom, worker.metier, worker.region, worker.prefecture, worker.commune, worker.competances, worker.experience]
            .map(normalizeText)
            .join(' ');
        const matchesSearch = !searchValue || text.includes(searchValue);
        const matchesMetier = !metierValue || worker.metier === metierValue;
        const matchesRegion = !regionValue || worker.region === regionValue;
        const matchesPrefecture = !prefectureValue || worker.prefecture === prefectureValue;
        const matchesCommune = !communeValue || worker.commune === communeValue;
        return matchesSearch && matchesMetier && matchesRegion && matchesPrefecture && matchesCommune;
    });

    renderWorkers(filtered);
}

function renderWorkers(workers) {
    const grid = document.getElementById('worker-grid');
    if (!grid) {
        return;
    }
    grid.innerHTML = '';
    if (workers.length === 0) {
        grid.innerHTML = '<p>Aucun ouvrier trouvé. Essaie un autre métier, une autre région ou une autre préfecture.</p>';
        return;
    }

    workers.forEach((worker) => {
                const card = document.createElement('article');
                card.className = 'worker-card';
                const photoHtml = worker.photo ?
                    `<div class="worker-photo"><img src="${worker.photo}" alt="Photo de ${worker.nom}" /></div>` :
                    '';
                card.innerHTML = `
      ${photoHtml}
      <h3>${worker.nom}</h3>
      <div class="worker-meta">
        <span class="chip">${worker.metier}</span>
        ${worker.region ? `<span class="chip">${worker.region}</span>` : ''}
        ${worker.prefecture ? `<span class="chip">${worker.prefecture}</span>` : ''}
      </div>
      <p><strong>Commune :</strong> ${worker.commune || 'Non précisée'}</p>
      <p><strong>Compétences :</strong> ${worker.competances}</p>
      <p><strong>Expérience :</strong> ${worker.experience}</p>
      ${worker.portfolio && worker.portfolio.length ? `
      <div class="portfolio-gallery">
        <h4>Portfolio chantier</h4>
        <div class="portfolio-grid">
          ${worker.portfolio.map((img) => `<img src="${img}" alt="Chantier de ${worker.nom}" />`).join('')}
        </div>
      </div>
      ` : ''}
      <p><strong>Téléphone :</strong> ${worker.telephone}</p>
      <div class="inline-actions">
        <a class="button button-secondary" href="tel:+224${sanitizePhone(worker.telephone)}">Appeler</a>
        <a class="button" href="https://wa.me/224${sanitizePhone(worker.telephone)}" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    `;
        grid.appendChild(card);
    });
}

function readImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function readImageFiles(files) {
    return Promise.all(files.map(readImageFile));
}

function sanitizePhone(number) {
    return String(number || '').replace(/\D/g, '').replace(/^0+/, '');
}