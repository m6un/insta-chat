import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import InfoBar from "../Infobar/Infobar";
import Input from "../Input/Input";
import "./Chat.css";
import Messages from "../Messages/Messages";
import TextContainer from "../TextContainer/TextContainer"

let socket;

function Chat({ location }) {
  const ENDPOINT = "https://instachatv0.herokuapp.com/";
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket = io(ENDPOINT);
    const { name, room } = queryString.parse(location.search);

    setRoom(room);
    setName(name);
    socket.emit("join", { name, room }, (error) => {
      if (error) alert(error);
    });
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  useEffect(() => {
    socket.on("roomData", ({users}) =>{
      setUsers(users)
    });
  },[])

  function sendMessage(event) {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => {
        setMessage("");
      });
    }
  }

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          sendMessage={sendMessage}
          setMessage={setMessage}
        ></Input>
      </div>
      <TextContainer users = {users} />

    </div>
  );
}

export default Chat;
