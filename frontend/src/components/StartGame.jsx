/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Button } from "./ui/button";

export function StartGame({ onStart }) {
return <Button onClick={onStart}>Start Game</Button>;
}
