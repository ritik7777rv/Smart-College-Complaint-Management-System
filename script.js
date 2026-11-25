
const KEY = "campusCareComplaints";

let complaints = JSON.parse(localStorage.getItem(KEY) || "[]");

const $ = id => document.getElementById(id);

const save = () => {
  localStorage.setItem(KEY, JSON.stringify(complaints));
};

// Generate unique complaint ID
function makeId() {
  return "CC-" + Math.floor(100000 + Math.random() * 900000);
}

// Switch between Student and Admin views
function showView(viewId) {
  document.querySelectorAll(".view").forEach(view => {
    view.hidden = view.id !== viewId;
  });

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.view === viewId
    );
  });

  if (viewId === "adminView") {
    renderAdmin();
  }
}

// Navigation buttons
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showView(btn.dataset.view);
  });
});

// Submit complaint
$("complaintForm").addEventListener("submit", event => {
  event.preventDefault();

  const complaint = {
    id: makeId(),
    name: $("studentName").value.trim(),
    studentId: $("studentId").value.trim(),
    category: $("category").value,
    location: $("location").value.trim(),
    description: $("description").value.trim(),
    status: "Pending",
    createdAt: new Date().toLocaleString("en-IN")
  };

  complaints.unshift(complaint);
  save();

  $("complaintForm").reset();

  $("successBox").hidden = false;

  $("successBox").innerHTML =
    `<strong>Complaint submitted successfully!</strong><br>
    Your complaint ID is <strong>${complaint.id}</strong>.
    Save this ID to track your complaint.`;

  // Copy complaint ID button
  const copyButton = document.createElement("button");

  copyButton.type = "button";
  copyButton.textContent = "Copy complaint ID";

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(complaint.id);
      copyButton.textContent = "Copied!";
    } catch {
      copyButton.textContent = complaint.id;
    }
  });

  $("successBox").append(copyButton);

  renderAdmin();
});

// Track complaint
$("trackForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = $("trackId").value.trim().toUpperCase();

  const complaint = complaints.find(item =>
    item.id.toUpperCase() === id
  );

  const result = $("trackResult");

  result.replaceChildren();

  if (!complaint) {
    result.textContent =
      "No complaint found. Please check the ID and try again.";
    return;
  }

  const box = document.createElement("div");
  box.className = "result-box";

  const title = document.createElement("strong");

  title.textContent =
    complaint.category + " · " + complaint.status;

  const details = document.createElement("p");

  details.textContent =
    `${complaint.id} | ${complaint.location} |
    Submitted: ${complaint.createdAt}`;

  details.className = "muted";

  box.append(title, details);

  result.append(box);
});

// Admin filter
$("adminFilter").addEventListener("change", renderAdmin);

// Display complaints in admin dashboard
function renderAdmin() {

  const counts = {
    total: complaints.length,

    pending: complaints.filter(c =>
      c.status === "Pending"
    ).length,

    progress: complaints.filter(c =>
      c.status === "In Progress"
    ).length,

    resolved: complaints.filter(c =>
      c.status === "Resolved"
    ).length
  };

  $("total").textContent = counts.total;
  $("pending").textContent = counts.pending;
  $("progress").textContent = counts.progress;
  $("resolved").textContent = counts.resolved;

  const filter = $("adminFilter").value;

  const shown = complaints.filter(c =>
    filter === "All" || c.status === filter
  );

  const list = $("adminList");

  list.replaceChildren();

  $("adminEmpty").hidden = shown.length > 0;

  shown.forEach(complaint => {

    const row = document.createElement("article");
    row.className = "complaint-row";

    const info = document.createElement("div");

    const heading = document.createElement("h4");

    heading.textContent =
      `${complaint.category} · ${complaint.id}`;

    const detail = document.createElement("p");

    detail.textContent =
      `${complaint.name} (${complaint.studentId}) ·
      ${complaint.location} · ${complaint.createdAt}`;

    const description = document.createElement("p");

    description.textContent = complaint.description;

    info.append(heading, detail, description);

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const status = document.createElement("span");

    status.className =
      "status " + complaint.status.replace(" ", "-");

    status.textContent = complaint.status;

    const select = document.createElement("select");

    select.setAttribute(
      "aria-label",
      `Update status for ${complaint.id}`
    );

    ["Pending", "In Progress", "Resolved"].forEach(value => {

      const option = document.createElement("option");

      option.value = value;
      option.textContent = value;
      option.selected = complaint.status === value;

      select.append(option);
    });

    // Update complaint status
    select.addEventListener("change", () => {

      complaint.status = select.value;

      save();
      renderAdmin();

    });

    actions.append(status, select);

    row.append(info, actions);

    list.append(row);

  });
}

// Load dashboard data when page opens
renderAdmin();
