// Varible untuk menampung beberapa object/data bookshelf
let bookshelf = [];
// Mendefenisikan Custom Event
const RENDER_EVENT = "render-bookshelf";
const SAVED_EVENT = "saved-bookshelf";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  const searchBookForm = document.getElementById("searchBook");
  if (searchBookForm) {
    searchBookForm.addEventListener("submit", function (event) {
      event.preventDefault();
      searchBook();
    });
  }
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const bookFormIsCompleteCheckBox =
    document.getElementById("bookFormIsComplete");
  const submitBookButton = document.getElementById("submitBookButton");
  const bookFormSubmitButton = document.getElementById("bookFormSubmit");

  function updateSubmitBookButton() {
    if (bookFormIsCompleteCheckBox.checked) {
      submitBookButton.innerText = "Selesai dibaca";
      bookFormSubmitButton.setAttribute(
        "data-testid",
        "bookFormSubmitButton_complete"
      );
    } else {
      submitBookButton.innerText = "Belum selesai dibaca";
      bookFormSubmitButton.setAttribute(
        "data-testid",
        "bookFormSubmitButton_incomplete"
      );
    }
  }
  bookFormIsCompleteCheckBox.addEventListener("change", updateSubmitBookButton);

  updateSubmitBookButton();
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser ===> Tidak Mendukung local storage");
    return false;
  }
  return true;
}

function addBook() {
  const title = document.getElementById("bookFormTitle").value.trim();
  const author = document.getElementById("bookFormAuthor").value.trim();
  const year = document.getElementById("bookFormYear").value.trim();
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const parsedYear = parseInt(year);
  if (isNaN(parsedYear) || parsedYear <= 0) {
    alert("Tahun Harus Berupa Angka dan tidak boleh negatif");
    return;
  }

  const isDuplicate = bookshelf.some(
    (book) =>
      book.title.toLowerCase() === title.toLowerCase() &&
      book.author.toLowerCase() === author.toLowerCase() &&
      parseInt(book.year) === parseInt(year)
  );
  if (isDuplicate) {
    alert("Judul, Penulis, dan Tahun yang sama sudah ada pada daftar buku");
    return;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    parsedYear,
    isComplete
  );
  bookshelf.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Buku berhasil ditambahkan");
  document.getElementById("bookForm").reset();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(bookshelf);
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;
  textTitle.setAttribute("data-testid", "bookItemTitle");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;
  textAuthor.setAttribute("data-testid", "bookItemAuthor");

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;
  textYear.setAttribute("data-testid", "bookItemYear");

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");

  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.innerText = "Belum selesai dibaca";
    undoButton.classList.add("complete-book");
    undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.classList.add("delete-book");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit Buku";
    editButton.classList.add("edit-book");
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.addEventListener("click", function () {
      editBookFromCompleted(bookObject.id);
    });

    container.append(undoButton, deleteButton, editButton);
  } else {
    const completeButton = document.createElement("button");
    completeButton.innerText = "Selesai dibaca";
    completeButton.classList.add("complete-book");
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.classList.add("delete-book");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
    deleteButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit Buku";
    editButton.classList.add("edit-book");
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.addEventListener("click", function () {
      editBookFromCompleted(bookObject.id);
    });

    container.append(completeButton, deleteButton, editButton);
  }

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(bookshelf);
  const incompleteBookshelfList = document.getElementById("incompleteBookList");
  incompleteBookshelfList.innerHTML = "";
  const completeBookshelfList = document.getElementById("completeBookList");
  completeBookshelfList.innerHTML = "";

  for (const bookItem of bookshelf) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of bookshelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  bookshelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Buku berhasil dihapus");
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  const title = prompt("Masukkan judul buku", bookTarget.title);
  if (title === null || title.trim() === "") {
    alert("Judul tidak boleh kosong, edit dibatalkan");
    return;
  }
  const author = prompt("Masukkan penulis buku", bookTarget.author);
  if (author === null || author.trim() === "") {
    alert("Penulis tidak boleh kosong, edit dibatalkan");
    return;
  }
  const year = prompt("Masukkan tahun buku", bookTarget.year);
  if (year === null || year.trim() === "") {
    alert("Tahun tidak boleh kosong, edit dibatalkan");
    return;
  }

  const parsedYear = parseInt(year);
  if (isNaN(parsedYear) || parsedYear <= 0) {
    alert("Tahun Harus Berupa Angka dan tidak boleh negatif, edit dibatalkan");
    return;
  }

  bookTarget.title = title.trim();
  bookTarget.author = author.trim();
  bookTarget.year = parsedYear;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  alert("Buku berhasil diedit");
}

function findBookIndex(bookId) {
  for (const index in bookshelf) {
    if (bookshelf[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function searchBook() {
  const searchBookTitle = document
    .getElementById("searchBookTitle")
    .value.trim()
    .toLowerCase();
  const incompleteBookshelfList = document.getElementById("incompleteBookList");
  const completeBookshelfList = document.getElementById("completeBookList");

  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  if (searchBookTitle === "") {
    document.dispatchEvent(new Event(RENDER_EVENT));
    return;
  }

  for (const bookItem of bookshelf) {
    if (bookItem.title.toLowerCase().includes(searchBookTitle)) {
      const bookElement = makeBook(bookItem);
      if (!bookItem.isComplete) {
        incompleteBookshelfList.append(bookElement);
      } else {
        completeBookshelfList.append(bookElement);
      }
    }
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    if (Array.isArray(data)) {
      bookshelf = data;
    } else {
      bookshelf = [];
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
