from tempfile import NamedTemporaryFile

import pytest

from engine.answers import Answers


@pytest.fixture(scope="module")
def answers_db():
    with NamedTemporaryFile(delete=False) as db_file:
        yield db_file.name


# Tests that modify DB are marked with `pytest.mark.dependency` for sequence
@pytest.mark.dependency()
def test_add_answer_1(answers_db):
    "Assure that adding answer behaves correctly"
    answers = Answers(db_file=answers_db)

    topic = "test_topic"
    user = "test_user"
    query = "Test query"
    answer = ["Test answer"]
    think = ["Test think"]
    model = "test_model"

    seq = answers.add_answer(topic, user, query, answer, think, model)

    # Verify that the answer is added to the database
    result = answers.cursor.execute(
        "SELECT * FROM answers WHERE Topic = ? AND Seq = ?", (topic, seq)
    ).fetchone()

    assert result is not None
    assert len(result) == 9
    assert result[0] == topic
    assert result[1] == seq == 1
    assert result[2] == user
    assert result[3].startswith("202")  # Enough like iso-8601
    assert len(result[3]) == 19  # YYYY-MM-DD HH:MM:SS
    assert result[4] == query
    assert result[5] == "Test answer"
    assert result[6] == "Test think"
    assert result[7] == model
    assert result[8] == 0  # Adding topic without inference < 1 second


@pytest.mark.dependency(depends_on="test_add_answer_1")
def test_add_answer_2(answers_db):
    "Adding second answer to the same topic should have a new sequence number"
    answers = Answers(db_file=answers_db)

    topic = "test_topic"
    user = "test_user"
    query = "Test query 2"
    answer = ["Test answer 2"]
    think = ["Test think 2"]
    model = "test_model"

    seq = answers.add_answer(topic, user, query, answer, think, model)

    # Verify that the answer is added to the database
    result = answers.cursor.execute(
        "SELECT * FROM answers WHERE Topic =? AND Seq =?", (topic, seq)
    ).fetchone()

    assert result is not None
    assert len(result) == 9
    assert result[0] == topic
    assert result[1] == seq == 2
