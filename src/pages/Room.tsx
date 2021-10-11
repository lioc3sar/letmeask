import { Button } from "../components/Button";
import { useParams } from "react-router-dom";
import logoImg from "../assets/images/logo.svg";
import { RoomCode } from "../components/RoomCode";

import "../styles/room.scss";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { database } from "../services/firebase";

type RoomParams = {
  id: string;
};

type FirebaseQuestions = Record<
  string,
  {
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighLighted: boolean;
  }
>;

type Question = {
    id: string;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighLighted: boolean;
  
}

export function Room() {
  const params = useParams<RoomParams>();

  const { user } = useAuth();

  const [newQuestion, setNewQuestion] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [title,setTitle] = useState('');
  const roomId = params.id;

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on("value", (room) => {
      console.log(room.val());

      const databaseRoom = room.val();
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

      const parsedQuestions = Object.entries(firebaseQuestions).map(
        ([key, value]) => {
          return {
            id: key,
            content: value.content,
            author: value.author,
            isHighLighted: value.isHighLighted,
            isAnswered: value.isAnswered,
          };
        }
      );

      console.log(parsedQuestions)
      setQuestions(parsedQuestions)
      setTitle(databaseRoom.title)
    });
  }, [roomId]);

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();
    if (newQuestion.trim() === "") {
      return;
    }

    if (!user) {
      toast.error("You must be logged in!");
    }

    const question = {
      content: newQuestion,
      author: {
        name: user?.name,
        avatar: user?.avatar,
      },
      isHighLighted: false,
      isAnswered: false,
    };

    await database.ref(`rooms/${roomId}/questions`).push(question);

    setNewQuestion("");
  }

  return (
    <>
      <div id="page-room">
        <header>
          <div className="content">
            <img src={logoImg} alt="Letmeask" />
            <RoomCode code={params.id} />
          </div>
        </header>

        <main className="content">
          <div className="room-title">
            <h1>Sala {title}</h1>
            {questions.length > 0 && <span>{questions.length} perguntas</span> }
            
          </div>

          <form onSubmit={handleSendQuestion}>
            <textarea
              placeholder="O que você quer perguntar?"
              onChange={(event) => setNewQuestion(event.target.value)}
              value={newQuestion}
            />

            <div className="form-footer">
              {user ? (
                <div className="user-info">
                  <img src={user.avatar} alt={user.name} />
                  <span>{user.name}</span>
                </div>
              ) : (
                <span>
                  Para enviar uma pergunta, <button>faça seu login</button>.
                </span>
              )}
              <Button type="submit" disabled={!user}>
                Enviar pergunta
              </Button>
            </div>
          </form>

          {JSON.stringify(questions)}
        </main>
      </div>
    </>
  );
}
