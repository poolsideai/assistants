from resources.book import *


def test_get_book(client):
    response = client.get("/books/1")
    assert response.status_code == 200
    assert response.json == {
        "id": 1,
        "title": "Python for Smarties",
        "author": "Stef Maruch and Aahz Maruch",
        "isbn": "978-1119195923",
        "published_date": "2020-08-15"
    }
