import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "fada67a2-b284-43c9-a3dd-83d618704b04",
    "Content-Type": "application/json",
  },
});

const editProfileButton = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const editProfileSubmitBtn =
  editProfileModal.querySelector(".modal__submit-btn");

const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");

const newPostButton = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostForm = newPostModal.querySelector(".modal__form");
const newPostLinkInput = newPostModal.querySelector("#card-image-input");
const newPostCaptionInput = newPostModal.querySelector("#card-caption-input");

const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector("#delete-form");
const deleteSubmitBtn = deleteForm.querySelector(".modal__submit-btn");
const deleteCancelBtn = deleteModal.querySelector(".delete-cancel-btn");
const deleteCloseBtn = deleteModal.querySelector(".modal__close-btn");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");
const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");

let selectedCard = null;
let selectedCardId = null;

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const likeBtn = cardElement.querySelector(".card__like-button");
  const deleteBtn = cardElement.querySelector(".card__delete-button");
  const likeCountEl = cardElement.querySelector(".card__like-count");

  cardElement.dataset.id = data._id || "";

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  if (data.isLiked) {
    likeBtn.classList.add("card__like-button_active");
  }
  if (likeCountEl && Array.isArray(data.likes)) {
    likeCountEl.textContent = String(data.likes.length);
  }

  likeBtn.addEventListener("click", () => {
    const isActive = likeBtn.classList.contains("card__like-button_active");
    likeBtn.disabled = true;

    api
      .handleLikeStatus(data._id, !isActive)
      .then((updated) => {
        if (updated.isLiked) {
          likeBtn.classList.add("card__like-button_active");
        } else {
          likeBtn.classList.remove("card__like-button_active");
        }
        if (likeCountEl && Array.isArray(updated.likes)) {
          likeCountEl.textContent = String(updated.likes.length);
        }
      })
      .catch(console.error)
      .finally(() => {
        likeBtn.disabled = false;
      });
  });

  deleteBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deleteModal);
}

function handleEscapeClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function handleOverlayClick(evt) {
  if (evt.target.classList.contains("modal")) {
    closeModal(evt.target);
  }
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscapeClose);
  modal.addEventListener("mousedown", handleOverlayClick);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscapeClose);
  modal.removeEventListener("mousedown", handleOverlayClick);
}

editProfileButton.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  const inputList = [editProfileNameInput, editProfileDescriptionInput];
  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

newPostButton.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

avatarModalBtn.addEventListener("click", function () {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", function () {
  closeModal(avatarModal);
});

function resetDeleteState() {
  selectedCard = null;
  selectedCardId = null;
}

if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener("click", () => {
    resetDeleteState();
    closeModal(deleteModal);
  });
}
if (deleteCloseBtn) {
  deleteCloseBtn.addEventListener("click", () => {
    resetDeleteState();
    closeModal(deleteModal);
  });
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const newName = editProfileNameInput.value.trim();
  const newAbout = editProfileDescriptionInput.value.trim();

  const originalBtnText = editProfileSubmitBtn.textContent;
  editProfileSubmitBtn.textContent = "Saving...";

  api
    .editUserInfo({ name: newName, about: newAbout })
    .then((user) => {
      profileNameEl.textContent = user.name;
      profileDescriptionEl.textContent = user.about;

      resetValidation(
        editProfileForm,
        [editProfileNameInput, editProfileDescriptionInput],
        settings
      );
      disableButton(editProfileSubmitBtn, settings);

      closeModal(editProfileModal);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      editProfileSubmitBtn.textContent = originalBtnText;
    });
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();

  const originalBtnText = cardSubmitBtn.textContent;
  cardSubmitBtn.textContent = "Saving...";

  api
    .addCard({
      name: newPostCaptionInput.value.trim(),
      link: newPostLinkInput.value.trim(),
    })
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);

      newPostForm.reset();
      closeModal(newPostModal);

      resetValidation(
        newPostForm,
        [newPostLinkInput, newPostCaptionInput],
        settings
      );
      disableButton(cardSubmitBtn, settings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      cardSubmitBtn.textContent = originalBtnText;
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const url = avatarInput.value.trim();

  const original = avatarSubmitBtn.textContent;
  avatarSubmitBtn.textContent = "Saving...";

  api
    .editAvatar(url)
    .then((user) => {
      profileAvatarEl.src = user.avatar;
      profileAvatarEl.alt = `${user.name} avatar`;
      avatarForm.reset();
      closeModal(avatarModal);

      resetValidation(avatarForm, [avatarInput], settings);
      disableButton(avatarSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      avatarSubmitBtn.textContent = original;
    });
}

function handleDeleteSubmit(e) {
  e.preventDefault();
  if (!selectedCardId || !selectedCard) return;

  const original = deleteSubmitBtn.textContent;
  deleteSubmitBtn.textContent = "Deleting...";

  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
      resetDeleteState();
    })
    .catch(console.error)
    .finally(() => {
      deleteSubmitBtn.textContent = original;
    });
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleNewPostSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);

enableValidation(settings);

api
  .getAppInfo()
  .then(([cards, user]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });

    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarEl.src = user.avatar;
    profileAvatarEl.alt = `${user.name} avatar`;
  })
  .catch(console.error);
