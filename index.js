//constants
const API_URL = "https://api.github.com/users/";

// DOM elements
const username = document.getElementById("username");
const profileContainer = document.getElementById("profile-header-container");
let totalRepo = 0;
let itemsPerPage = 10;
let currentPage = 1;
let totalPages = 0;

const getInfoBtn = document.getElementById("get_info_btn");
const errorMessage = document.getElementsByClassName("error-message")[0];
const dropDownBtn = document.querySelector(".dropdown-btn");
const dropDownMenu = document.querySelector(".dropdown-menu");
const dropdown = document.querySelector(".dropdown");
const repositoriesContainer = document.getElementsByClassName(
  "repositories-container"
)[0];
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

// Event listeners
prevBtn.addEventListener("click", () => setCurrentPage(currentPage - 1));
nextBtn.addEventListener("click", () => setCurrentPage(currentPage + 1));
dropDownBtn.addEventListener("click", showDropdown);
dropDownMenu.addEventListener("mouseleave", hideDropdown);

dropDownMenu.addEventListener("click", function (e) {
  const target = e.target;
  if (target.classList.contains("dropdown-item")) {
    itemsPerPage = target.innerHTML;
    dropdown.querySelector(
      ".dropdown-btn"
    ).textContent = `Result per page: ${itemsPerPage}`;
    repositoriesContainer.innerHTML = "";
    currentPage = 1;
    totalPages = Math.ceil(totalRepo / itemsPerPage);
    getRepositories(itemsPerPage, currentPage);
    displayPagination(totalPages);
    dropDownMenu.style.display = "none";
  }
});

getInfoBtn.addEventListener("click", getUserInfo);

const displayUserData = (data) => {
  profileContainer.classList.remove("hide");
  const profilePicture = document.getElementById("profile_photo");
  const userName = document.getElementById("user_name");
  const userBio = document.getElementById("user_bio");
  const userAdderess = document.getElementById("user_adderes");
  const userTwitterUrl = document.getElementById("user_twitter_url");
  const userGithub = document.getElementById("user_github");
  profilePicture.src = data?.avatar_url;
  userName.innerHTML = `Name : ${data?.name}`;
  userBio.innerHTML = `Bio : ${data?.bio}`;
  userAdderess.innerHTML = `Adderess :${data?.location}`;
  userTwitterUrl.innerHTML = `${data?.twitter_username}`;
  userGithub.href = data?.html_url;
  userGithub.innerHTML = data?.html_url;
};

async function getUserInfo() {
  errorMessage.classList.add("hide");
  repositoriesContainer.innerHTML =
    "<div><img src='/gif/loading.gif' alt='Loading...' /></div>";
  try {
    const res = await fetch(`${API_URL}${username.value}`);
    const json = await res.json();
    if (res.status === 403) {
      errorMessage.textContent = "API Limit Exceeded!";
      errorMessage.classList.remove("hide");
      return;
    }

    if (json.message === "Not Found") {
      errorMessage.textContent = "User not found.";
      errorMessage.classList.remove("hide");
      return;
    }

    totalRepo = json?.public_repos;
    totalPages = Math.ceil(totalRepo / itemsPerPage);
    displayUserData(json);
    getRepositories(itemsPerPage, currentPage);
    displayPagination(totalPages);
  } catch (error) {
    console.log(error);
  }
}

// Function to get repositories
const getRepositories = async (itemsPerPage, currentPage) => {
  try {
    const res = await fetch(
      `${API_URL}${username.value}/repos?per_page=${itemsPerPage}&page=${currentPage}`
    );

    if (res.status === 403) {
      // Forbidden, handle accordingly
      errorMessage.textContent =
        "API request forbidden. Check your access permissions.";
      errorMessage.classList.remove("hide");
      return;
    }

    const repositories = await res.json();
    repositoriesContainer.innerHTML = "";
    repositories.forEach(async (repo) => {
      const repoElement = document.createElement("div");
      repoElement.className += "repository";
      const languagesRes = await fetch(repo.languages_url);
      const languagesData = await languagesRes.json();
      const languages = Object.keys(languagesData);

      repoElement.innerHTML = `
      <div><h4>${repo.name}</h4>
      <p>${
        repo?.description
          ? `${repo.description.slice(0, 45)}${
              repo.description.length > 45 ? "..." : ""
            }`
          : "No Description"
      }</p>

      <ul class="techstack-container">
        ${languages
          .slice(0, 5)
          .map((language) => `<li class="techstack">${language}</li>`)
          .join("")}
      </ul></div>
      <div><a href="${
        repo.html_url
      }" target="_blank" class="github-repo-link"><i class="fab fa-github"></i></a></div>
        `;

      repositoriesContainer.appendChild(repoElement);
    });
  } catch (error) {
    console.log(error);
  }
};

// Function to display pagination
function displayPagination(totalPages) {
  prevBtn.classList.remove("hide");
  nextBtn.classList.remove("hide");
  const paginationDiv = document.getElementById("page-btns");
  paginationDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageElement = document.createElement("button");
    pageElement.className = `page-btn page-btn-${i}`;

    if (i === currentPage) {
      pageElement.classList.add("current-page");
    }

    pageElement.textContent = i;

    pageElement.addEventListener("click", () => {
      const prev = document.querySelector(".current-page");
      prev?.classList.remove("current-page");
      pageElement.classList.add("current-page");
      currentPage = i;
      getRepositories(itemsPerPage, currentPage);
    });

    paginationDiv.appendChild(pageElement);
  }
}

function setCurrentPage(pageNo) {
  if (pageNo >= 1 && pageNo <= totalPages) {
    currentPage = pageNo;
    const prev = document.querySelector(".current-page");
    prev?.classList.remove("current-page");
    const curr = document.querySelector(`.page-btn-${pageNo}`);
    curr.classList.add("current-page");
    getRepositories(itemsPerPage, currentPage);
  }
}

// Function to show the dropdown menu
function showDropdown() {
  document.querySelector(".dropdown-menu").style.display = "block";
}

// Function to hide the dropdown menu
function hideDropdown() {
  document.querySelector(".dropdown-menu").style.display = "none";
}
