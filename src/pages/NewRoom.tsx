import { Link,useHistory} from "react-router-dom";
import illustration from "../assets/images/illustration.svg";
import logoImg from "../assets/images/logo.svg";
import { Button } from "../components/Button";
import '../styles/auth.scss';
import { useAuth } from "../hooks/useAuth";
import {FormEvent, useState} from "react";
import { auth, database } from "../services/firebase";
import { Sidebar } from "../components/Sidebar";

export function NewRoom() {

        const {user} = useAuth();

        const history = useHistory();

        const [newRoom,setNewRoom] = useState('');

        async function handleCreateRoom(event:FormEvent) {
            event.preventDefault();

            console.log(newRoom);

            if(newRoom.trim() === ""){ //tira os espaços e se não estiver vazia
              return;
            }

            const roomRef = database.ref('rooms');

            const firebaseRoom = await roomRef.push({
              title: newRoom,
              authorId: user?.id,
            });

            history.push(`/rooms/${firebaseRoom.key}`)
        }


  return (
    <div id="page-auth">
      <Sidebar/>
      <main>
        <div className="main-content">
          <img src={logoImg} alt="Letmeask" />
          <h2> Criar uma nova sala</h2>
          <form onSubmit={handleCreateRoom}>
            <input type="text" placeholder="Nome da sala" onChange={event => setNewRoom(event.target.value)} value={newRoom} />
            <Button type="submit">Criar sala</Button>
          </form>
          <p>Quer entrar em uma sala ecistente? <Link to="/">Clique aqui</Link></p>
        </div>
      </main>
    </div>
  );
}
