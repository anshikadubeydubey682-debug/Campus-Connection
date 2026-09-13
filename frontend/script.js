/* ==========================================================================
   CAMPUSCONNECT - INTERACTIVE JAVASCRIPT LOGIC
   ========================================================================== */

const SUN_SVG = `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const MOON_SVG = `<svg class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

/* --- API CLIENT (With Graceful Fallback) --- */
const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = {
    async request(endpoint, options = {}, fallbackKey = null) {
        try {
            const token = localStorage.getItem('campus_jwt');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...(options.headers || {})
            };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            
            // Sync with local storage on success if a fallback key is provided
            if (fallbackKey && options.method !== 'GET') {
                let localData = JSON.parse(localStorage.getItem(fallbackKey)) || [];
                localData.unshift(data);
                localStorage.setItem(fallbackKey, JSON.stringify(localData));
            }
            
            return data;
        } catch (error) {
            console.warn(`[Backend Offline] Falling back to localStorage for ${endpoint}. Error: ${error.message}`);
            if (fallbackKey && (!options.method || options.method === 'GET')) {
                return JSON.parse(localStorage.getItem(fallbackKey)) || [];
            }
            if (fallbackKey && options.method === 'POST') {
                let localData = JSON.parse(localStorage.getItem(fallbackKey)) || [];
                const mockData = JSON.parse(options.body || "{}");
                mockData.id = Date.now();
                mockData.createdAt = new Date().toISOString();
                localData.unshift(mockData);
                localStorage.setItem(fallbackKey, JSON.stringify(localData));
                return mockData;
            }
            throw error;
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSidebar();
    initProfileMenu();
    initNoticeSearch();
    initCategoryFilters();
    initEventRSVP();
    initForms();
    initAttendance();
    initResources();
    loadProfileData();
});

const aktuSyllabus = {
    "Computer Science (CSE)": {
        "1st Sem": ["Engineering Mathematics", "Engineering Physics", "Programming for Problem Solving", "Fundamentals of Electrical Engineering", "Engineering Graphics & Design"],
        "2nd Sem": ["Engineering Mathematics-II", "Engineering Chemistry", "Fundamentals of Electronics Engineering", "mechanical engineering", "Soft Skills"],
        "3rd Sem": ["Data Structures", "Object Oriented Programming", "Discrete Mathematics", "Engineering Mathematics-4", "Computer Organization & Architecture", "universal human values"],
        "4th Sem": ["Operating System", "tafl", "python", "oops", "Technical Communication", "cyber secqurity"],
        "5th Sem": ["Database Management System", "Web Technology", "Design & Analysis of Algorithms", "application of soft computing", "oosd with c++", "coil"],
        "6th Sem": ["Machine Learning", "Artificial Intelligence", "Cloud Computing", "Information Security / Cyber Security", "Distributed Systems", "Data Mining", "Data Analytics", "Mobile Application Development", "Advanced Computer Networks"],
        "7th Sem": ["Advanced Algorithms", "Big Data", "Data Science", "Deep Learning", "Natural Language Processing", "Blockchain", "Internet of Things", "Cloud Computing", "DevOps", "Information Security", "Distributed Computing", "Advanced DBMS", "Computer Vision", "Parallel Computing"],
        "8th Sem": ["Major Project", "Project Seminar", "Internship", "Technical Elective", "Open Elective", "Entrepreneurship", "Professional Ethics", "Research Methodology"]
    },
    "Information Technology (IT)": {
        "1st Sem": ["Engineering Mathematics", "Engineering Physics", "Programming for Problem Solving", "Fundamentals of Electrical Engineering", "Engineering Graphics & Design"],
        "2nd Sem": ["Engineering Mathematics-II", "Engineering Chemistry", "Fundamentals of Electronics Engineering", "mechanical engineering", "Soft Skills"],
        "3rd Sem": ["Data Structures", "Computer Organization & Architecture", "Discrete Mathematics", "Digital Logic Design", "Information Theory"]
    }
};

/* --------------------------------------------------------------------------
   1. THEME SWITCHER
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeBtn = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("campus_theme") || "light";
    
    if (savedTheme === "dark") {
        document.body.setAttribute("data-theme", "dark");
        if (themeBtn) themeBtn.innerHTML = SUN_SVG;
    } else {
        document.body.removeAttribute("data-theme");
        if (themeBtn) themeBtn.innerHTML = MOON_SVG;
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = document.body.getAttribute("data-theme");
            if (currentTheme === "dark") {
                document.body.removeAttribute("data-theme");
                localStorage.setItem("campus_theme", "light");
                themeBtn.innerHTML = MOON_SVG;
                showToast("Switched to Light Mode");
            } else {
                document.body.setAttribute("data-theme", "dark");
                localStorage.setItem("campus_theme", "dark");
                themeBtn.innerHTML = SUN_SVG;
                showToast("Switched to Dark Mode");
            }
        });
    }
}

/* --------------------------------------------------------------------------
   2. SIDEBAR TOGGLE
   -------------------------------------------------------------------------- */
function initSidebar() {
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.querySelector(".sidebar");

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }
}

/* --------------------------------------------------------------------------
   3. STUDENT & FACULTY PROFILE MENU
   -------------------------------------------------------------------------- */
function initProfileMenu() {
    const profileBtn = document.getElementById("studentProfile");
    const profileMenu = document.getElementById("profileMenu");

    if (profileBtn && profileMenu) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
                profileMenu.classList.remove("show");
            }
        });
    }
}

function loadProfileData() {
    const role = localStorage.getItem("campus_user_role") || "student";
    const userName = localStorage.getItem("campus_user_name") || (role === 'faculty' ? 'Prof. Dr. Rajesh Sharma' : 'Student');
    
    // Default profile based on B.Tech structure
    const profile = JSON.parse(localStorage.getItem("campus_profile")) || {
        name: userName,
        email: "student@campusconnect.edu",
        university: "AKTU",
        course: "Computer Science (CSE)",
        year: "3rd Year",
        semester: "6th Sem",
        section: "A"
    };

    document.querySelectorAll(".profile-name-val").forEach(el => el.textContent = profile.name);
    document.querySelectorAll(".profile-course-val").forEach(el => el.textContent = profile.course);
    document.querySelectorAll(".profile-year-val").forEach(el => el.textContent = profile.year);
    document.querySelectorAll(".profile-section-val").forEach(el => el.textContent = profile.section);
    document.querySelectorAll(".profile-circle").forEach(el => {
        el.textContent = profile.name.charAt(0).toUpperCase();
    });

    // Populate settings form if inputs exist
    const nameInput = document.getElementById("settingName");
    const emailInput = document.getElementById("settingEmail");
    const universityInput = document.getElementById("settingUniversity");
    const courseInput = document.getElementById("settingBranch");
    const yearInput = document.getElementById("settingYear");
    const semesterInput = document.getElementById("settingSemester");
    const sectionInput = document.getElementById("settingSection");

    if (nameInput) nameInput.value = profile.name;
    if (emailInput) emailInput.value = profile.email || "student@campusconnect.edu";
    if (universityInput) universityInput.value = profile.university || "AKTU";
    if (courseInput) courseInput.value = profile.course || "Computer Science (CSE)";
    if (yearInput) yearInput.value = profile.year || "3rd Year";
    if (semesterInput) semesterInput.value = profile.semester || "6th Sem";
    if (sectionInput) sectionInput.value = profile.section || "A";
}

/* --------------------------------------------------------------------------
   4. LIVE SEARCH & FILTERS
   -------------------------------------------------------------------------- */
function initNoticeSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const items = document.querySelectorAll(".notice-card, .event-card, .resource-card, .lost-card");

    if (searchInput && items.length > 0) {
        const filterItems = () => {
            const query = searchInput.value.toLowerCase().trim();
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? "" : "none";
            });
        };

        searchInput.addEventListener("input", filterItems);
        if (searchButton) searchButton.addEventListener("click", filterItems);
    }
}

function initCategoryFilters() {
    const filterTabs = document.querySelectorAll(".filter-tab");
    const filterableCards = document.querySelectorAll("[data-category]");

    filterTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const category = tab.getAttribute("data-filter");

            filterableCards.forEach(card => {
                const cardCategory = card.getAttribute("data-category");
                if (category === "all" || cardCategory === category) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
}

function initEventRSVP() {
    const rsvpBtns = document.querySelectorAll(".rsvp-btn");
    rsvpBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.classList.contains("btn-primary")) {
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-secondary");
                btn.textContent = "Registered";
                showToast("Registered for event");
            } else {
                btn.classList.remove("btn-secondary");
                btn.classList.add("btn-primary");
                btn.textContent = "RSVP Now";
                showToast("Registration cancelled");
            }
        });
    });
}

/* --------------------------------------------------------------------------
   5. FORMS
   -------------------------------------------------------------------------- */
function initForms() {
    const complaintForm = document.getElementById("complaintForm");
    if (complaintForm) {
        complaintForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const category = document.getElementById("complaintCategory").value;
            const title = document.getElementById("complaintTitle").value;
            const description = document.getElementById("complaintDesc").value;

            const complaintList = document.getElementById("complaintList");
            if (complaintList) {
                const newComplaint = {
                    title: title,
                    category: category,
                    description: description,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                };
                
                let savedComplaints = JSON.parse(localStorage.getItem('campus_complaints')) || [];
                savedComplaints.unshift(newComplaint);
                localStorage.setItem('campus_complaints', JSON.stringify(savedComplaints));
                
                const newCard = document.createElement("div");
                newCard.className = "notice-card";
                newCard.innerHTML = `
                    <div class="notice-header">
                        <span class="badge badge-warning">Under Review</span>
                        <span class="notice-date">Just Now</span>
                    </div>
                    <h3>${title}</h3>
                    <p><strong>Category:</strong> ${category}</p>
                    <p>${description}</p>
                `;
                complaintList.prepend(newCard);
            }

            complaintForm.reset();
            showToast("Complaint submitted");
        });
    }

    // Load saved complaints on page load
    const complaintList = document.getElementById("complaintList");
    if (complaintList) {
        const savedComplaints = JSON.parse(localStorage.getItem('campus_complaints')) || [];
        savedComplaints.forEach(c => {
            const newCard = document.createElement("div");
            newCard.className = "notice-card";
            newCard.innerHTML = `
                <div class="notice-header">
                    <span class="badge badge-warning">Under Review</span>
                    <span class="notice-date">${c.date}</span>
                </div>
                <h3>${c.title}</h3>
                <p><strong>Category:</strong> ${c.category}</p>
                <p>${c.description}</p>
            `;
            complaintList.prepend(newCard);
        });
    }

    const doubtForm = document.getElementById("doubtForm");
    const doubtSubjectSelect = document.getElementById("doubtSubject");
    if (doubtSubjectSelect) {
        // Populate all subjects across all semesters for CSE as an example
        doubtSubjectSelect.innerHTML = "";
        Object.values(aktuSyllabus["Computer Science (CSE)"]).forEach(subjects => {
            subjects.forEach(sub => {
                const opt = document.createElement("option");
                opt.value = sub.toLowerCase().replace(/\s+/g, '-');
                opt.textContent = sub;
                doubtSubjectSelect.appendChild(opt);
            });
        });
        
        let customSubjects = JSON.parse(localStorage.getItem('campus_custom_subjects')) || [];
        customSubjects.forEach(sub => {
            const opt = document.createElement("option");
            opt.value = sub.toLowerCase().replace(/\s+/g, '-');
            opt.textContent = sub;
            doubtSubjectSelect.appendChild(opt);
        });
    }

    if (doubtForm) {
        doubtForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const subject = document.getElementById("doubtSubject").value;
            const question = document.getElementById("doubtQuestion").value;

            const doubtFeed = document.getElementById("doubtFeed");
            if (doubtFeed) {
                const newDoubt = document.createElement("div");
                newDoubt.className = "doubt-card";
                newDoubt.innerHTML = `
                    <div class="notice-header">
                        <span class="notice-tag">${subject}</span>
                        <span class="notice-date">Posted Just Now</span>
                    </div>
                    <h3>${question}</h3>
                    
                    <div id="${aiContainerId}" style="margin-top: 15px; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span class="badge badge-warning">⏳ AI Generating Solution...</span>
                        </div>
                        <p style="font-size: 13px; color: var(--text-muted);">Please wait while AI analyzes your question...</p>
                    </div>

                    <div class="student-replies-list" style="margin-top: 15px;"></div>

                    <div style="margin-top: 15px; display: flex; align-items: center; justify-content: space-between;">
                        <small class="reply-count" style="color: var(--success); font-weight: 700;">0 Student Replies</small>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary btn-sm reply-btn" style="padding: 6px 12px; font-size: 12.5px;">Solve / Reply</button>
                            <button class="btn btn-secondary btn-sm edit-doubt-btn" style="padding: 6px 12px; font-size: 12.5px;">Edit</button>
                            <button class="btn btn-secondary btn-sm delete-doubt-btn" style="padding: 6px 12px; font-size: 12.5px; color: var(--danger); border-color: var(--danger);">Delete</button>
                        </div>
                    </div>
                `;
                doubtFeed.prepend(newDoubt);

                // Attach delete/edit event listeners
                newDoubt.querySelector('.delete-doubt-btn').addEventListener('click', () => {
                    if (confirm("Are you sure you want to delete this doubt?")) {
                        newDoubt.remove();
                        showToast("Doubt deleted successfully");
                    }
                });
                newDoubt.querySelector(".reply-btn").addEventListener("click", (e) => {
                    const replyModal = document.getElementById("replyModal");
                    if (replyModal) replyModal.style.display = "flex";
                    // For dynamically created doubts, set the global target for the reply
                    if (typeof currentReplyTarget !== 'undefined') {
                        currentReplyTarget = e.target.closest('.doubt-card').querySelector('.student-replies-list');
                    } else {
                        window.currentReplyTarget = e.target.closest('.doubt-card').querySelector('.student-replies-list');
                    }
                });
                newDoubt.querySelector('.edit-doubt-btn').addEventListener('click', () => {
                    const newQuestion = prompt("Edit your doubt:", question);
                    if (newQuestion) {
                        newDoubt.querySelector('h3').textContent = newQuestion;
                        showToast("Doubt updated");
                    }
                });
                
                // Simulate AI generating a solution after 3.5 seconds
                setTimeout(() => {
                    const aiContainer = document.getElementById(aiContainerId);
                    if (aiContainer) {
                        aiContainer.innerHTML = `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <span class="badge badge-info">🤖 AI Solution</span>
                                <small style="color: var(--text-muted);">Generated instantly</small>
                            </div>
                            <p style="font-size: 13px; margin-bottom: 10px;">This is an AI-generated explanation based on your query. (Mocked response)</p>
                            <div style="position: relative; height: 200px; border-radius: 8px; overflow: hidden; margin-top: 10px;">
                                <video width="100%" height="100%" controls style="object-fit: cover; background: #000;">
                                    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                                    Your browser does not support HTML video.
                                </video>
                            </div>
                        `;
                        showToast("AI has solved your doubt!");
                    }
                }, 3500);
                
                // Re-bind reply buttons
                initReplyModals();
            }

            doubtForm.reset();
            showToast("Doubt posted");
        });
    }

    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const sem = document.getElementById("settingSemester").value;
            const checkedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);
            
            // Validation rules
            let minRequired = 0;
            if (sem === "1st Sem" || sem === "2nd Sem") minRequired = 5;
            else if (["3rd Sem", "4th Sem", "5th Sem", "6th Sem"].includes(sem)) minRequired = 6;
            else if (sem === "7th Sem" || sem === "8th Sem") minRequired = 3;

            if (checkedSubjects.length < minRequired) {
                showToast(`Error: ${sem} requires a minimum of ${minRequired} subjects.`);
                return;
            }

            const newProfile = {
                name: document.getElementById("settingName").value,
                email: document.getElementById("settingEmail").value,
                university: document.getElementById("settingUniversity").value,
                course: document.getElementById("settingBranch").value,
                year: document.getElementById("settingYear").value,
                semester: document.getElementById("settingSemester").value,
                section: document.getElementById("settingSection").value,
                selectedSubjects: checkedSubjects
            };

            localStorage.setItem("campus_profile", JSON.stringify(newProfile));
            loadProfileData();
            showToast("Profile and Subjects saved!");
        });
        
        // Initialize dynamic subjects mapping
        initDynamicSubjects();
    }

    initReplyModals();
}

function initDynamicSubjects() {
    const branchSelect = document.getElementById("settingBranch");
    const semSelect = document.getElementById("settingSemester");
    const container = document.getElementById("subjectCheckboxContainer");
    const helpText = document.getElementById("subjectSelectionHelp");
    const customInput = document.getElementById("customSubjectInput");
    const addCustomBtn = document.getElementById("addCustomSubjectBtn");
    
    if (!branchSelect || !semSelect || !container) return;

    const createCheckbox = (val, isChecked = false) => {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.gap = "8px";
        
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "subject-checkbox";
        cb.value = val;
        cb.checked = isChecked;
        cb.style.width = "16px";
        cb.style.height = "16px";
        cb.style.accentColor = "var(--primary)";
        
        const lbl = document.createElement("label");
        lbl.textContent = val;
        lbl.style.cursor = "pointer";
        lbl.onclick = () => { cb.checked = !cb.checked; };
        
        div.appendChild(cb);
        div.appendChild(lbl);
        return div;
    };

    const updateSubjects = () => {
        const branch = branchSelect.value;
        const sem = semSelect.value;
        
        let minRequired = 0;
        if (sem === "1st Sem" || sem === "2nd Sem") minRequired = 5;
        else if (["3rd Sem", "4th Sem", "5th Sem", "6th Sem"].includes(sem)) minRequired = 6;
        else if (sem === "7th Sem" || sem === "8th Sem") minRequired = 3;
        
        helpText.textContent = `Minimum required subjects for ${sem}: ${minRequired}`;
        
        container.innerHTML = "";
        
        // Load saved subjects if available and matching current sem/branch to avoid wiping out user selections
        const savedProfile = JSON.parse(localStorage.getItem("campus_profile"));
        let savedSubjects = [];
        if (savedProfile && savedProfile.semester === sem && savedProfile.course === branch && savedProfile.selectedSubjects) {
            savedSubjects = savedProfile.selectedSubjects;
        }
        
        const defaultSubjects = (aktuSyllabus[branch] && aktuSyllabus[branch][sem]) ? aktuSyllabus[branch][sem] : [];
        
        // Merge default and saved subjects (to include custom ones)
        const allSubjectsToRender = [...new Set([...defaultSubjects, ...savedSubjects])];

        if (allSubjectsToRender.length > 0) {
            allSubjectsToRender.forEach(sub => {
                // Check it if it was saved, otherwise leave unchecked (or default to checked if no saved profile exists yet)
                const isChecked = savedSubjects.length > 0 ? savedSubjects.includes(sub) : false;
                container.appendChild(createCheckbox(sub, isChecked));
            });
        } else {
            container.innerHTML = "<div style='color: var(--text-muted); padding: 4px 0;'>No default subjects found. Please add custom subjects.</div>";
        }
    };

    if (addCustomBtn && customInput) {
        addCustomBtn.addEventListener("click", () => {
            const val = customInput.value.trim();
            if (val) {
                // Remove the "No default subjects" message if it exists
                if (container.querySelector("div[style*='color: var(--text-muted)']")) {
                    container.innerHTML = "";
                }
                container.appendChild(createCheckbox(val, true));
                customInput.value = "";
            }
        });
    }

    branchSelect.addEventListener("change", updateSubjects);
    semSelect.addEventListener("change", updateSubjects);
    
    // Initial update
    updateSubjects();
}

function initReplyModals() {
    const replyBtns = document.querySelectorAll(".reply-btn");
    const replyModal = document.getElementById("replyModal");
    const closeReplyModal = document.getElementById("closeReplyModal");
    const cancelReply = document.getElementById("cancelReply");
    const replyForm = document.getElementById("replyForm");

    if (replyModal) {
        replyBtns.forEach(btn => {
            // Remove existing listener to prevent duplicates
            btn.replaceWith(btn.cloneNode(true));
        });
        
        document.querySelectorAll(".reply-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                replyModal.style.display = "flex";
            });
        });

        const closeModal = () => { replyModal.style.display = "none"; };
        
        // Add click listeners to all EXISTING reply buttons on page load
        document.querySelectorAll(".reply-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                if (replyModal) replyModal.style.display = "flex";
                // Find the nearest .student-replies-list in this doubt card
                window.currentReplyTarget = e.target.closest('.notice-card, .doubt-card').querySelector('.student-replies-list');
            });
        });

        if (closeReplyModal) closeReplyModal.addEventListener("click", closeModal);
        if (cancelReply) cancelReply.addEventListener("click", closeModal);
        
        if (replyForm) {
            replyForm.onsubmit = (e) => {
                e.preventDefault();
                
                if (window.currentReplyTarget) {
                    const textInput = replyForm.querySelector("textarea").value;
                    const photoInput = replyForm.querySelector("input[accept='image/*']");
                    const videoInput = replyForm.querySelector("input[accept='video/*']");
                    
                    let mediaHtml = "";
                    
                    if (videoInput && videoInput.files.length > 0) {
                        const fileUrl = URL.createObjectURL(videoInput.files[0]);
                        mediaHtml = `<video controls style="width: 100%; border-radius: var(--radius-md); max-height: 300px; background: #000; margin-top: 8px;"><source src="${fileUrl}"></video>`;
                    } else if (photoInput && photoInput.files.length > 0) {
                        const fileUrl = URL.createObjectURL(photoInput.files[0]);
                        mediaHtml = `<img src="${fileUrl}" style="width: 100%; border-radius: var(--radius-md); max-height: 400px; object-fit: contain; background: var(--bg-main); margin-top: 8px;">`;
                    }
                    
                    const userName = localStorage.getItem('campus_user_name') || 'Student';
                    const initial = userName.charAt(0).toUpperCase();

                    const replyHtml = `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <div class="profile-circle" style="width: 24px; height: 24px; font-size: 12px; background: var(--accent);">${initial}</div>
                            <strong style="font-size: 13.5px;">${userName} (You)</strong>
                            <small style="color: var(--text-muted); margin-left: auto;">Just now</small>
                        </div>
                        ${textInput ? `<p style="font-size: 13.5px; margin-bottom: 4px;">${textInput}</p>` : ''}
                        ${mediaHtml}
                    </div>
                    `;
                    
                    window.currentReplyTarget.insertAdjacentHTML('beforeend', replyHtml);
                    
                    // Update reply count text if possible
                    const replyCountText = window.currentReplyTarget.parentElement.querySelector('small:first-child');
                    if (replyCountText && replyCountText.textContent.includes('Answers yet')) {
                        replyCountText.textContent = '1 Answer (Student)';
                        replyCountText.style.color = 'var(--success)';
                    }
                }
                
                closeModal();
                showToast("Solution submitted successfully!");
                replyForm.reset();
            };
        }
    }
}

/* --------------------------------------------------------------------------
   6. ATTENDANCE
   -------------------------------------------------------------------------- */
function initAttendance() {
    const calendar = document.getElementById("calendar");
    if (!calendar) return;

    let currentDate = new Date(); // Start with current date
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let chartInstance = null;

    const renderCalendar = () => {
        calendar.innerHTML = "";
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const currentMonthSpan = document.getElementById("currentMonth");
        if (currentMonthSpan) {
            currentMonthSpan.textContent = `${monthNames[month]} ${year}`;
        }

        const today = new Date();
        const monthIsFuture = (year > today.getFullYear()) || (year === today.getFullYear() && month > today.getMonth());

        // Update Dashboard Summary Stats from real localStorage data
        let basePresent = 0, baseAbsent = 0, baseLate = 0;
        
        let attendanceData = JSON.parse(localStorage.getItem("campus_attendance")) || {};
        
        const daysInMonthForStats = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= daysInMonthForStats; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (attendanceData[dateStr]) {
                if (attendanceData[dateStr] === 'present') basePresent++;
                else if (attendanceData[dateStr] === 'absent') baseAbsent++;
                else if (attendanceData[dateStr] === 'late') baseLate++;
            }
        }
        
        const total = basePresent + baseAbsent + baseLate;
        const percentage = total === 0 ? "0.0" : ((basePresent / total) * 100).toFixed(1);

        const overallEl = document.getElementById("overallPercentage");
        const presentEl = document.getElementById("presentCount");
        const absentEl = document.getElementById("absentCount");
        const lateEl = document.getElementById("lateCount");

        if (overallEl) overallEl.textContent = percentage + "%";
        if (presentEl) presentEl.textContent = basePresent;
        if (absentEl) absentEl.textContent = baseAbsent;
        if (lateEl) lateEl.textContent = baseLate;

        // Update Chart
        const ctx = document.getElementById('attendanceChart');
        if (ctx && typeof Chart !== 'undefined') {
            if (chartInstance) {
                chartInstance.destroy();
            }
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Present', 'Absent', 'Late'],
                    datasets: [{
                        label: 'Days',
                        data: [basePresent, baseAbsent, baseLate],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.6)',
                            'rgba(220, 53, 69, 0.6)',
                            'rgba(255, 193, 7, 0.6)'
                        ],
                        borderColor: [
                            'rgb(40, 167, 69)',
                            'rgb(220, 53, 69)',
                            'rgb(255, 193, 7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Optionally update progress bars to look dynamic
        const progressFills = document.querySelectorAll(".subject-progress-fill");
        progressFills.forEach((el, index) => {
            const val = Math.min(100, Math.max(0, 70 + (month * 2) + (index * 5)));
            el.style.width = val + "%";
            const percentText = el.parentElement.nextElementSibling;
            if (percentText && percentText.tagName === "STRONG") {
                percentText.textContent = val + "%";
            }
        });

        dayNames.forEach(day => {
            const header = document.createElement("div");
            header.className = "calendar-day-name";
            header.textContent = day;
            calendar.appendChild(header);
        });

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Adjust for Monday start (0 = Sun, 1 = Mon ... 6 = Sat)
        let startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < startDayIndex; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-date empty";
            calendar.appendChild(empty);
        }

        // removed double declaration of today
        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement("div");
            dateCell.className = "calendar-date";
            dateCell.textContent = day;

            const cellDate = new Date(year, month, day);

            // Real status based on localStorage
            let status = "upcoming";
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (attendanceData[dateStr]) {
                status = attendanceData[dateStr];
                dateCell.classList.add(status);
            } else if (cellDate <= today) {
                // Not marked by faculty yet
                status = "unmarked";
                dateCell.classList.add("unmarked");
            }

            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dateCell.classList.add("today");
            }

            dateCell.addEventListener("click", () => {
                document.querySelectorAll(".calendar-date.selected").forEach(c => c.classList.remove("selected"));
                dateCell.classList.add("selected");
                const info = document.getElementById("selectedDateInfo");
                if (info) {
                    info.innerHTML = `<strong>${monthNames[month].substring(0, 3)} ${day}, ${year}</strong>: Status <span class="badge badge-${status === 'present' ? 'success' : status === 'absent' ? 'danger' : 'warning'}">${status.toUpperCase()}</span>`;
                }
            });

            calendar.appendChild(dateCell);
        }
    };

    renderCalendar();

    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener("click", () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

/* --------------------------------------------------------------------------
   7. TOASTS
   -------------------------------------------------------------------------- */
function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
        background: var(--bg-surface-elevated);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: 10px 18px;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        font-weight: 600;
        font-size: 13px;
        transition: opacity 0.3s ease;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/* --------------------------------------------------------------------------
   8. RESOURCES PAGE LOGIC
   -------------------------------------------------------------------------- */
window.openVideoModal = function(url, title) {
    const modal = document.getElementById("videoModal");
    const iframe = document.getElementById("videoModalIframe");
    const modalTitle = document.getElementById("videoModalTitle");
    
    if (modal && iframe) {
        // Convert watch URL to embed URL if it's a standard youtube link
        let embedUrl = url;
        if (url.includes("youtube.com/watch?v=")) {
            embedUrl = url.replace("watch?v=", "embed/");
        } else if (url.includes("youtu.be/")) {
            embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
        }
        
        iframe.src = embedUrl;
        if (modalTitle) modalTitle.textContent = title || "Video Lecture";
        modal.style.display = "flex";
        
        const closeBtn = document.getElementById("closeVideoModal");
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = "none";
                iframe.src = ""; // Stop video from playing in background
            };
        }
    }
};

function initResources() {
    const resourcesGrid = document.getElementById("resourcesGrid");
    if (!resourcesGrid) return;
    
    let savedResources = JSON.parse(localStorage.getItem('campus_resources')) || [];
    
    // Seed default data if empty so the page doesn't look blank
    if (savedResources.length === 0) {
        savedResources = [
            {
                title: "Complete Data Structures Tutorial",
                category: "video",
                date: "2 days ago",
                link: "https://www.youtube.com/watch?v=RBSGKlAvoiM", // Example DSA video
                subject: "Data Structures",
                faculty: "Dr. Sharma"
            },
            {
                title: "Chapter 1: Operating System Concepts",
                category: "notes",
                date: "5 days ago",
                link: "#",
                subject: "Operating System",
                faculty: "Prof. Verma"
            }
        ];
        localStorage.setItem('campus_resources', JSON.stringify(savedResources));
    }

    resourcesGrid.innerHTML = "";
    
    savedResources.forEach(res => {
        const card = document.createElement("div");
        card.className = "event-card";
        
        let iconHtml = "";
        let buttonHtml = "";
        
        if (res.category === "video") {
            iconHtml = `<div style="font-size: 24px; margin-bottom: 12px; color: var(--danger);">🎥</div>`;
            buttonHtml = `<button class="btn btn-primary" style="width: 100%;" onclick="openVideoModal('${res.link}', '${res.title.replace(/'/g, "\\'")}')">Watch Video</button>`;
        } else {
            iconHtml = `<div style="font-size: 24px; margin-bottom: 12px; color: var(--primary);">📄</div>`;
            buttonHtml = `<button class="btn btn-secondary" style="width: 100%;" onclick="showToast('Downloading Notes...')">Download PDF</button>`;
        }
        
        card.innerHTML = `
            ${iconHtml}
            <div class="event-date">${res.date}</div>
            <h3>${res.title}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px;"><strong>Subject:</strong> ${res.subject}<br><strong>Uploaded by:</strong> ${res.faculty || "Faculty"}</p>
            ${buttonHtml}
        `;
        
        resourcesGrid.prepend(card);
    });
}