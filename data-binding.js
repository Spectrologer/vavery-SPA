// Data Binding Module - Loads JSON data and populates HTML templates
const DataBinding = (function() {
    let projectsData = null;
    let aboutData = null;

    // Cache for loaded data
    const dataCache = new Map();

    // Cache for loaded scripts
    const scriptCache = new Set();

    // Load script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (scriptCache.has(src)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                scriptCache.add(src);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Load JSON data from file
    async function loadData(filePath) {
        if (dataCache.has(filePath)) {
            return dataCache.get(filePath);
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status}`);
            }
            const data = await response.json();
            dataCache.set(filePath, data);
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    // Get color class for tags
    function getTagColorClass(color) {
        const colorMap = {
            'red': 'red',
            'blue': 'blue',
            'cyan': 'cyan',
            'green': 'green',
            'purple': 'purple',
            'yellow': 'yellow',
            'orange': 'orange'
        };
        return colorMap[color] || 'gray';
    }

    // Render project tags
    function renderTags(tags) {
        return tags.map(tag => {
            const colorClass = getTagColorClass(tag.color);
            return `<span class="px-3 py-1 bg-${colorClass}-600/20 text-${colorClass}-300 text-sm rounded-full">${tag.text}</span>`;
        }).join(' ');
    }

    // Render project stats
    function renderStats(stats) {
        return `
            <div class="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
                <div class="text-center">
                    <div class="text-xl font-bold text-white">Duration: <br/>${stats.duration}</div>
                </div>
                <div class="text-center">
                    <div class="text-xl font-bold text-white">${stats.teamSize}</div>
                    <div class="text-sm text-gray-400">Team Size</div>
                </div>
                <div class="text-center">
                    <div class="text-sm text-gray-400">Platform</div>
                    <div class="text-xl font-bold text-white">${stats.platform}</div>
                </div>
            </div>
        `;
    }

    // Render project links
    function renderLinks(links, projectId) {
        return links.map(link => {
            const buttonClass = link.type === 'primary'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-600 hover:bg-gray-700';
            return `<a href="${link.url}" target="_blank" class="btn ${buttonClass} px-6 py-3 rounded-lg font-semibold text-white text-center transition-all">
                <i class="${link.icon} mr-2"></i>
                ${link.text}
            </a>`;
        }).join(' ');
    }

    // Render case study content
    function renderCaseStudy(caseStudy, projectId) {
        let content = '';

        if (caseStudy.problemStatement) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Problem Statement</h4>
                <p class="text-gray-300 mb-6">${caseStudy.problemStatement}</p>
            `;
        }

        if (caseStudy.keyChallenges) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Key Challenges</h4>
                <ul class="text-gray-300 space-y-2 mb-6">
                    ${caseStudy.keyChallenges.map(challenge =>
                        `<li class="flex items-start"><i class="fas fa-dot-circle text-red-400 mt-2 mr-3 text-xs"></i>${challenge}</li>`
                    ).join('')}
                </ul>
            `;
        }

        if (caseStudy.designConstraints) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Design Constraints</h4>
                <ul class="text-gray-300 space-y-2 mb-6">
                    ${caseStudy.designConstraints.map(constraint =>
                        `<li class="flex items-start"><i class="fas fa-dot-circle text-green-400 mt-2 mr-3 text-xs"></i>${constraint}</li>`
                    ).join('')}
                </ul>
            `;
        }

        if (caseStudy.researchInsights) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Research Insights</h4>
                <ul class="text-gray-300 space-y-2 mb-6">
                    ${caseStudy.researchInsights.map(insight =>
                        `<li class="flex items-start"><i class="fas fa-dot-circle text-blue-400 mt-2 mr-3 text-xs"></i>${insight}</li>`
                    ).join('')}
                </ul>
            `;
        }

        if (caseStudy.solutionApproach) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Solution Approach</h4>
                <p class="text-gray-300 mb-6">${caseStudy.solutionApproach}</p>
            `;
        }

        if (caseStudy.designPhilosophy) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Design Philosophy</h4>
                <p class="text-gray-300 mb-6">${caseStudy.designPhilosophy}</p>
            `;
        }

        if (caseStudy.visualStrategy) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Visual Strategy</h4>
                <p class="text-gray-300 mb-6">${caseStudy.visualStrategy}</p>
            `;
        }

        if (caseStudy.keyFeatures) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Key Features</h4>
                <ul class="text-gray-300 space-y-2">
                    ${caseStudy.keyFeatures.map(feature =>
                        `<li class="flex items-start"><i class="fas fa-check text-green-400 mt-2 mr-3 text-xs"></i>${feature}</li>`
                    ).join('')}
                </ul>
            `;
        }

        if (caseStudy.keyDecisions) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Key Decisions</h4>
                <ul class="text-gray-300 space-y-2">
                    ${caseStudy.keyDecisions.map(decision =>
                        `<li class="flex items-start"><i class="fas fa-check text-green-400 mt-2 mr-3 text-xs"></i>${decision}</li>`
                    ).join('')}
                </ul>
            `;
        }

        if (caseStudy.impactGoals) {
            content += `
                <h4 class="text-xl font-semibold text-white mb-4">Impact Goals</h4>
                <ul class="text-gray-300 space-y-2">
                    ${caseStudy.impactGoals.map(goal =>
                        `<li class="flex items-start"><i class="fas fa-check text-green-400 mt-2 mr-3 text-xs"></i>${goal}</li>`
                    ).join('')}
                </ul>
            `;
        }

        return content;
    }

    // Render a single project
    function renderProject(project) {
        const caseStudyContent = project.caseStudy ? renderCaseStudy(project.caseStudy, project.id) : '';

        return `
            <div class="project-showcase bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div class="project-image-container flex justify-center">
                        <img src="${project.image}" alt="${project.imageAlt}" class="w-full h-auto rounded-lg shadow-lg object-contain max-w-80" loading="lazy">
                    </div>
                    <div class="project-info">
                        <div class="flex items-center flex-wrap gap-2 md:gap-4 mb-4">
                            <h3 id="${project.id}-title" class="text-2xl font-bold text-white">${project.title}</h3>
                            ${renderTags(project.tags)}
                        </div>
                        <p class="text-gray-300 mb-6 leading-relaxed">${project.description}</p>
                        ${renderStats(project.stats)}
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button class="case-study-toggle btn bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-white transition-all" data-project="${project.id}" aria-expanded="false" aria-controls="${project.id}-case-study">
                                <i class="fas fa-chevron-down mr-2 transition-transform"></i>
                                View Case Study
                            </button>
                            ${renderLinks(project.links, project.id)}
                        </div>
                    </div>
                </div>
                ${caseStudyContent ? `
                    <div class="case-study-content mt-8 border-t border-gray-700/50 pt-8 overflow-x-auto" id="${project.id}-case-study" aria-labelledby="${project.id}-title" aria-hidden="true">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 min-w-0">
                            ${caseStudyContent}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Render projects section
    function renderProjectsSection(projects, sectionTitle) {
        if (!projects || projects.length === 0) return '';

        return `
            <h1 class="text-4xl sm:text-5xl">${sectionTitle}</h1>
            <div class="space-y-12 w-full">
                ${projects.map(project => renderProject(project)).join('')}
            </div>
        `;
    }

    // Render art gallery
    function renderArtGallery(artData) {
        if (!artData) return '';

        return `
            <div class="w-full mt-20">
                <h1 class="text-4xl font-bold text-white mb-4 text-center">${artData.title}</h1>
                <p class="text-gray-400 mb-12 max-w-2xl text-center mx-auto">${artData.description}</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${artData.images.map(image => `
                        <div class="gallery-image-container">
                            <img src="${image.thumb}" data-full="${image.full}" class="gallery-image" alt="${image.alt}" data-caption="${image.caption}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render easter egg
    function renderEasterEgg(easterEggData) {
        if (!easterEggData) return '';

        return `
            <div class="text-center mt-20 border-t border-gray-700/50 pt-12">
                <a href="${easterEggData.url}" target="_blank" class="inline-block p-4 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all Duration::-300 transform hover:scale-110" title="${easterEggData.title}">
                    <i class="fas fa-chess-rook text-4xl text-gray-300"></i>
                </a>
                <p class="text-xs text-gray-500 mt-4">${easterEggData.description}</p>
            </div>
        `;
    }

    // Populate projects page
    async function populateProjectsPage() {
        if (!projectsData) {
            projectsData = await loadData('data/projects.json');
        }

        if (!projectsData) return;

        const container = document.querySelector('.content-container');
        if (!container) return;

        let html = '';

        // Development projects
        if (projectsData.development) {
            html += renderProjectsSection(projectsData.development, 'Development');
        }

        // Design projects
        if (projectsData.design) {
            html += '<p class="text-gray-400 mb-12 max-w-2xl text-center mx-auto">Here\'s some of the stuff I\'ve worked on.</p>';
            html += renderProjectsSection(projectsData.design, 'Design');
        }

        // Art gallery
        if (projectsData.art) {
            html += renderArtGallery(projectsData.art);
        }

        // Easter egg
        if (projectsData.easterEgg) {
            html += renderEasterEgg(projectsData.easterEgg);
        }

        container.innerHTML = html;

        // Load lightbox script for gallery functionality
        try {
            await loadScript('lightbox.js?v=1.0.1');
            if (typeof Lightbox !== 'undefined' && Lightbox.initializeProjectsPage) {
                Lightbox.initializeProjectsPage();
            }
        } catch (error) {
            console.error('Failed to load lightbox script:', error);
        }
    }

    // Render technical skills
    function renderTechnicalSkills(skills) {
        return skills.map(skill => `
            <div class="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 hover:bg-gray-800">
                <i class="${skill.icon} text-3xl skill-card" style="color: var(--theme-color);"></i>
                <span>${skill.name}</span>
            </div>
        `).join('');
    }

    // Render UX skills
    function renderUXSkills(skills) {
        return skills.map(skill => `
            <div class="bg-gray-800/50 p-6 rounded-lg">
                <h3 class="text-xl font-semibold text-white mb-3 flex items-center gap-3">
                    <i class="${skill.icon} skill-card" style="color: var(--theme-color);"></i>
                    ${skill.title}
                </h3>
                <ul class="text-gray-300 list-disc list-inside space-y-2">
                    ${skill.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    // Render experience
    function renderExperience(experience) {
        return experience.map(exp => `
            <div class="bg-gray-800/50 p-6 rounded-lg">
                <div class="flex justify-between items-baseline">
                    <h3 class="text-xl font-semibold text-white">${exp.title}</h3>
                    <p class="text-sm text-gray-400">${exp.period}</p>
                </div>
                <p class="mt-2 text-gray-300">${exp.description}</p>
            </div>
        `).join('');
    }

    // Populate about page
    async function populateAboutPage() {
        if (!aboutData) {
            aboutData = await loadData('data/about.json');
        }

        if (!aboutData) return;

        const container = document.querySelector('.content-container');
        if (!container) return;

        let html = '';

        // About section
        if (aboutData.about) {
            html += `
                <section id="about-me" class="text-center md:text-left">
                    <div class="flex flex-col md:flex-row items-center gap-8">
                        <img
                            src="${aboutData.about.image}"
                            alt="${aboutData.about.imageAlt}"
                            class="profile-image w-48 h-48 rounded-full object-cover border-4"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='https://placehold.co/192x192/1F2937/E5E7EB?text=VA';"
                        >
                        <div class="flex-1">
                            <h2 class="text-3xl font-bold text-white mb-4">${aboutData.about.title}</h2>
                            <p class="text-lg leading-relaxed">${aboutData.about.description}</p>
                        </div>
                    </div>
                </section>
                <hr class="my-8 border-gray-700">
            `;
        }

        // Technical skills
        if (aboutData.technicalSkills) {
            html += `
                <section id="skills">
                    <h2 class="text-3xl font-bold text-white mb-6 text-center">Technical Skills</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                        ${renderTechnicalSkills(aboutData.technicalSkills)}
                    </div>
                </section>
            `;
        }

        // UX skills
        if (aboutData.uxSkills) {
            html += `
                <section id="ux-skills" class="mt-8">
                    <h2 class="text-3xl font-bold text-white mb-6 text-center">UX Design Skills</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${renderUXSkills(aboutData.uxSkills)}
                    </div>
                </section>
                <hr class="my-8 border-gray-700">
            `;
        }

        // Experience
        if (aboutData.experience) {
            html += `
                <section id="experience">
                    <h2 class="text-3xl font-bold text-white mb-6 text-center">Experience</h2>
                    <div class="space-y-8">
                        ${renderExperience(aboutData.experience)}
                    </div>
                </section>
            `;
        }

        container.innerHTML = html;
    }

    // Initialize data binding for a page
    async function initPage(pageType) {
        switch (pageType) {
            case 'projects':
                await populateProjectsPage();
                break;
            case 'about':
                await populateAboutPage();
                break;
            default:
                console.warn(`Unknown page type: ${pageType}`);
        }
    }

    return {
        initPage,
        loadData
    };
})();
