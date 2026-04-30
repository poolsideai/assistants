import pytest
from resources.book import *


def test_get_all_books(client):
    response = client.get("/books")
    assert response.status_code == 200
    assert len(response.json) == 6
    # Check that we have the expected books
    book_titles = [book["title"] for book in response.json]
    assert "War and Peace" in book_titles
    assert "Python for Dummies" in book_titles


def test_get_book_by_id(client):
    response = client.get("/books/1")
    assert response.status_code == 200
    assert response.json == {
        "id": 1,
        "title": "Python for Dummies",
        "isbn": "978-1119195923",
        "published_date": "2020-08-15"
    }


def test_get_nonexistent_book(client):
    response = client.get("/books/999")
    assert response.status_code == 404
    assert response.json == "Not found"


def test_create_new_book(client):
    new_book = {
        "title": "New Test Book",
        "author": "Test Author",
        "isbn": "978-1234567890",
        "published_date": "2023-01-01"
    }

    response = client.post("/books", json=new_book)
    assert response.status_code == 200

    # Check that the book was created with correct data
    result = response.json
    assert result["title"] == "New Test Book"
    assert result["author"] == "Test Author"
    assert result["id"] == 6  # Next available ID

    # Verify the book was actually added to the list
    response = client.get("/books")
    assert len(response.json) == 7


def test_update_book(client):
    update_data = {
        "title": "Updated Book Title",
        "author": "Updated Author",
        "isbn": "978-0987654321",
        "published_date": "2022-01-01"
    }

    response = client.put("/books/2", json=update_data)
    assert response.status_code == 200

    # Check that the book was updated correctly
    result = response.json
    assert result["id"] == 2
    assert result["title"] == "Updated Book Title"
    assert result["author"] == "Updated Author"


def test_update_nonexistent_book(client):
    update_data = {
        "title": "Should not update",
        "author": "Should not work",
        "isbn": "978-1111111111",
        "published_date": "2023-01-01"
    }

    response = client.put("/books/999", json=update_data)
    assert response.status_code == 200
    assert response.json is None


def test_validate_barcode_correct_length_and_digits(client):
    # Test a valid ISBN-13 barcode
    valid_barcode = "9780306406157"
    assert Book.validate_barcode(valid_barcode) == valid_barcode


def test_validate_barcode_incorrect_length():
    with pytest.raises(ValueError, match="Barcode must be 13 characters long"):
        Book.validate_barcode("1234567890")  # Only 10 characters


def test_validate_barcode_not_all_digits():
    with pytest.raises(ValueError, match="Barcode must be a number"):
        Book.validate_barcode("1234567890ABCD")  # Contains letters


def test_find_one_method():
    book_instance = Book()
    result = book_instance.find_one(1)
    assert result is not None
    assert result["id"] == 1
    assert result["title"] == "Python for Dummies"


def test_find_one_with_nonexistent_id():
    book_instance = Book()
    result = book_instance.find_one(999)
    assert result is None
