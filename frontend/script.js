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
    loadProfileData(); // Move this before initForms so defaults are set correctly!
    initNoticeSearch();
    initCategoryFilters();
    initEventRSVP();
    initForms();
    initAttendance();
    initResources();
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



    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const sem = document.getElementById("settingSemester").value;

            const newProfile = {
                name: document.getElementById("settingName").value,
                email: document.getElementById("settingEmail").value,
                university: document.getElementById("settingUniversity").value,
                course: document.getElementById("settingBranch").value,
                year: document.getElementById("settingYear").value,
                semester: document.getElementById("settingSemester").value,
                section: document.getElementById("settingSection").value
            };

            localStorage.setItem("campus_profile", JSON.stringify(newProfile));
            loadProfileData();
            showToast("Profile saved successfully!");
        });
    }

    initReplyModals();
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
        
        let userDept = localStorage.getItem('campus_user_dept') || "Computer Science (CSE)";
        // Backwards compatibility for older user sessions
        if (userDept === "Computer Science") userDept = "Computer Science (CSE)";
        if (userDept === "Information Technology") userDept = "Information Technology (IT)";
        if (userDept === "Electronics & Comm") userDept = "Electronics (ECE)";
        if (userDept === "Mechanical Engg") userDept = "Mechanical (ME)";
        
        let userSem = localStorage.getItem('campus_user_semester') || "3rd Sem";
        
        let subjectsList = ["Java Programming", "Database Management", "Data Structures", "Web Development"]; // Fallback
        const savedProfile = JSON.parse(localStorage.getItem('campus_profile'));
        
        if (savedProfile && savedProfile.selectedSubjects && savedProfile.selectedSubjects.length > 0) {
            subjectsList = savedProfile.selectedSubjects;
        } else if (typeof aktuSyllabus !== 'undefined' && aktuSyllabus[userDept] && aktuSyllabus[userDept][userSem]) {
            subjectsList = aktuSyllabus[userDept][userSem];
        }
        
        // Upgrade old data format if needed
        if (Object.keys(attendanceData).length > 0) {
            const firstKey = Object.keys(attendanceData)[0];
            if (typeof attendanceData[firstKey] === 'string') {
                attendanceData = {}; // reset to generate new format
            }
        }
        
        // --- ADD MOCK DATA FOR WORKING FUNCTIONALITY DEMO ---
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
        let hasDataForThisMonth = Object.keys(attendanceData).some(key => key.startsWith(monthPrefix));
        
        // Check if existing data matches current subjects list
        if (hasDataForThisMonth) {
            const sampleKey = Object.keys(attendanceData).find(key => key.startsWith(monthPrefix));
            const existingSubjects = Object.keys(attendanceData[sampleKey].subjects || {});
            
            // If the subjects in the stored data don't perfectly match the current subjectsList, we need to regenerate
            const subjectsMatch = existingSubjects.length === subjectsList.length && 
                                existingSubjects.every(sub => subjectsList.includes(sub));
            
            if (!subjectsMatch) {
                // Delete all records for this month so they are regenerated with new subjects
                Object.keys(attendanceData).forEach(key => {
                    if (key.startsWith(monthPrefix)) {
                        delete attendanceData[key];
                    }
                });
                hasDataForThisMonth = false;
            }
        }
        
        if (!hasDataForThisMonth && !monthIsFuture) {
            const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
            const maxDays = (year === today.getFullYear() && month === today.getMonth()) ? today.getDate() : daysInTargetMonth;
            
            for (let d = 1; d <= maxDays; d++) {
                const dateObj = new Date(year, month, d);
                if (dateObj.getDay() !== 0 && dateObj.getDay() !== 6) { // Weekdays only
                    const rand = Math.random();
                    let overallStatus = 'present';
                    if (rand > 0.85) overallStatus = 'absent';
                    else if (rand > 0.75) overallStatus = 'late';
                    
                    const subData = {};
                    subjectsList.forEach(sub => {
                        let sStat = overallStatus;
                        // Add randomness to individual subjects
                        if (overallStatus !== 'present' && Math.random() > 0.6) sStat = 'present';
                        subData[sub] = sStat;
                    });
                    
                    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    attendanceData[dStr] = { overall: overallStatus, subjects: subData };
                }
            }
            localStorage.setItem("campus_attendance", JSON.stringify(attendanceData));
        }
        // ----------------------------------------------------        
        const daysInMonthForStats = new Date(year, month + 1, 0).getDate();
        let chartLabels = [];
        let cumulativePresentData = [];
        let currentCumulative = 0;

        let subjectStats = {};
        subjectsList.forEach(s => subjectStats[s] = { total: 0, present: 0 });

        for (let d = 1; d <= daysInMonthForStats; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const shortMonth = monthNames[month].substring(0, 3);
            chartLabels.push(`${shortMonth} ${d}`);

            if (attendanceData[dateStr]) {
                const dayStatus = attendanceData[dateStr].overall;
                if (dayStatus === 'present') basePresent++;
                else if (dayStatus === 'absent') baseAbsent++;
                else if (dayStatus === 'late') baseLate++;
                
                // Track subject level stats
                if (attendanceData[dateStr].subjects) {
                    const subs = attendanceData[dateStr].subjects;
                    Object.keys(subs).forEach(s => {
                        if (!subjectStats[s]) subjectStats[s] = { total: 0, present: 0 };
                        subjectStats[s].total++;
                        if (subs[s] === 'present') subjectStats[s].present++;
                    });
                }
            }
            
            currentCumulative = basePresent;
            
            const cellDate = new Date(year, month, d);
            // Only plot up to today if it's the current month, or all days if it has data
            if (cellDate <= today || attendanceData[dateStr]) {
                cumulativePresentData.push(currentCumulative);
            } else {
                cumulativePresentData.push(null);
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

        const totalImpressionsEl = document.getElementById("totalImpressionsText");
        if (totalImpressionsEl) totalImpressionsEl.textContent = basePresent;
        
        const dateRangeEl = document.getElementById("graphDateRange");
        if (dateRangeEl) {
            dateRangeEl.innerHTML = `<option>${monthNames[month]} ${year}</option>`;
        }
        
        const trendEl = document.getElementById("attendanceTrend");
        if (trendEl) {
            const percFloat = parseFloat(percentage);
            if (percFloat >= 75) {
                trendEl.innerHTML = `▲ +${(percFloat - 75).toFixed(1)}%`;
                trendEl.style.color = "var(--success)";
            } else {
                trendEl.innerHTML = `▼ ${(percFloat - 75).toFixed(1)}%`;
                trendEl.style.color = "var(--danger)";
            }
        }

        // Update Chart
        const ctx = document.getElementById('attendanceChart');
        if (ctx && typeof Chart !== 'undefined') {
            if (chartInstance) {
                chartInstance.destroy();
            }
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Cumulative Classes Attended',
                        data: cumulativePresentData,
                        borderColor: '#0284c7', // Professional blue
                        backgroundColor: 'rgba(2, 132, 199, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3, // Smooth curve
                        pointRadius: 3,
                        pointBackgroundColor: '#0284c7'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Classes Attended'
                            }
                        },
                        x: {
                            ticks: {
                                maxTicksLimit: 10
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Total Present: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                }
            });
        }



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
                status = attendanceData[dateStr].overall;
                dateCell.classList.add(status);
            } else if (cellDate <= today) {
                // Not marked by faculty yet
                status = "unmarked";
                dateCell.classList.add("unmarked");
            }

            if (day === today.getDate()) {
                dateCell.classList.add("today");
            }

            dateCell.addEventListener("click", () => {
                document.querySelectorAll(".calendar-date.selected").forEach(c => c.classList.remove("selected"));
                dateCell.classList.add("selected");
                const info = document.getElementById("selectedDateInfo");
                if (info) {
                    let breakdownHtml = "";
                    if (status === 'upcoming' || status === 'unmarked') {
                        breakdownHtml = `<div style="padding: 10px; color: var(--text-muted); text-align: center;">No attendance data recorded yet.</div>`;
                    } else if (attendanceData[dateStr] && attendanceData[dateStr].subjects) {
                        breakdownHtml = `<ul style="list-style: none; padding: 0; margin: 10px 0 0 0; display: flex; flex-direction: column; gap: 8px;">`;
                        const subs = attendanceData[dateStr].subjects;
                        Object.keys(subs).forEach(sub => {
                            const subStatus = subs[sub]; 
                            const badgeClass = subStatus === 'present' ? 'success' : subStatus === 'absent' ? 'danger' : 'warning';
                            breakdownHtml += `
                                <li style="display: flex; justify-content: space-between; padding: 8px 12px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                    <span style="font-weight: 600; font-size: 13px;">${sub}</span>
                                    <span class="badge badge-${badgeClass}" style="font-size: 11px;">${subStatus.toUpperCase()}</span>
                                </li>`;
                        });
                        breakdownHtml += `</ul>`;
                    }

                    info.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                            <strong style="font-size: 15px;">${monthNames[month]} ${day}, ${year}</strong>
                            <span class="badge badge-${status === 'present' ? 'success' : status === 'absent' ? 'danger' : status === 'late' ? 'warning' : 'info'}">${status.toUpperCase()}</span>
                        </div>
                        ${breakdownHtml}
                    `;
                }
            });

            calendar.appendChild(dateCell);
        }

        // Update Subject Breakdown HTML dynamically
        const subjContainer = document.getElementById("subjectAttendance");
        if (subjContainer && Object.keys(subjectStats).length > 0) {
            let html = "";
            Object.keys(subjectStats).forEach(s => {
                const stat = subjectStats[s];
                const percent = stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
                
                html += `
                    <div class="subject-row">
                        <div>
                            <strong>${s}</strong><br>
                            <small style="color: var(--text-muted);">${stat.present} / ${stat.total} Classes</small>
                        </div>
                        <div class="subject-progress"><div class="subject-progress-fill" style="width: ${percent}%;"></div></div>
                        <strong>${percent}%</strong>
                    </div>
                `;
            });
            subjContainer.innerHTML = html || "<div style='color: var(--text-muted);'>No classes recorded for this month.</div>";
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

/* --------------------------------------------------------------------------
   9. LOST & FOUND LOGIC
   -------------------------------------------------------------------------- */
window.handleLostFoundSubmit = function(event) {
    event.preventDefault();
    
    const type = document.getElementById('itemStatus').value;
    const title = document.getElementById('itemTitle').value;
    const location = document.getElementById('itemLocation').value;
    const desc = document.getElementById('itemDesc').value;
    
    const newItem = {
        type: type, // 'lost' or 'found'
        title: title,
        location: location,
        desc: desc,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    
    let items = JSON.parse(localStorage.getItem('campus_lost_found')) || [];
    items.unshift(newItem);
    localStorage.setItem('campus_lost_found', JSON.stringify(items));
    
    showToast('Item report registered successfully!');
    document.getElementById('lostFoundForm').reset();
    
    initLostFound();
};

window.initLostFound = function() {
    const grid = document.querySelector('.events-grid');
    if (!grid || !document.getElementById('lostFoundForm')) return;
    
    let savedItems = JSON.parse(localStorage.getItem('campus_lost_found')) || [];
    
    if (savedItems.length === 0) {
        savedItems = [
            {
                type: 'lost',
                title: 'Wireless Earbuds',
                location: 'CS Building, 2nd Floor',
                desc: 'Lost near Computer Science Lab 2 during the afternoon lecture session.',
                date: 'Reported Today'
            },
            {
                type: 'found',
                title: 'Leather Key Pouch',
                location: 'Central Library',
                desc: 'Found near the central library cafeteria table with 3 keys attached.',
                date: 'Reported Yesterday'
            },
            {
                type: 'lost',
                title: 'Data Structures Textbook',
                location: 'Main Canteen',
                desc: 'Hardcover edition with handwritten notes inside the front cover.',
                date: '08 Sept 2026'
            }
        ];
        localStorage.setItem('campus_lost_found', JSON.stringify(savedItems));
    }
    
    const activeFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    
    grid.innerHTML = "";
    
    savedItems.forEach(item => {
        if (activeFilter !== 'all' && item.type !== activeFilter) return;
        
        const card = document.createElement("article");
        card.className = `event-card lost-card`;
        card.dataset.category = item.type;
        
        let badgeHtml = item.type === 'lost' 
            ? `<span class="badge badge-danger">LOST ITEM</span>`
            : `<span class="badge badge-success">FOUND ITEM</span>`;
            
        let footerHtml = item.type === 'lost'
            ? `<span class="badge badge-info">Contact Admin</span>
               <button class="btn btn-secondary" onclick="alert('Contact security desk or call student helpline.')">Claim Item</button>`
            : `<span class="badge badge-success">At Security Office</span>
               <button class="btn btn-primary" onclick="alert('Item deposited at Security Office Gate 1.')">View Details</button>`;
               
        card.innerHTML = `
            <div class="event-content">
                <div class="notice-header">
                    ${badgeHtml}
                    <span class="notice-date">${item.date}</span>
                </div>
                <h3>${item.title}</h3>
                <p>${item.desc}</p>
                <div class="event-meta">
                    <span>${item.location}</span>
                </div>
                <div class="event-footer">
                    ${footerHtml}
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
};

// Initialize if on the page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('lostFoundForm')) {
        initLostFound();
        
        // Setup filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                initLostFound();
            });
        });
    }
});