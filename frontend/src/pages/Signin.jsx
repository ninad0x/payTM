import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/Subheading"
import axios from "axios"
import { useState } from "react"

export const Signin = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

    return <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center h-max p-4">
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your credentials to access your account"} />
          <InputBox onChange={(e) => {
            setUsername(e.target.value)
          }} placeholder="abc" label={"Username"} type={"Text"} />
          
          <InputBox onChange={(e) => {
            setPassword(e.target.value)
          }} placeholder="123456" label={"Password"} type={"Password"} />

          <div className="pt-4">
            <Button label={"Sign in"} onClick={() => {
              axios.post("http://localhost:3000/api/v1/user/signin",
                {
                  username: username,
                  password: password
                }).then((response) => {
                  localStorage.setItem("token", response.data.token)
                  
                })

            }} />
          </div>
          <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
        </div>
      </div>
  </div>
}