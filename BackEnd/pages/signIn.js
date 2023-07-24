import { useRef } from 'react';
import { useRouter } from 'next/router'
import TextField from "@components/TextField";
import Button from "@components/Button"
import Image from 'next/image'
import * as apiPath from "@apiPath";
import * as msg from "@msg";
import { getInputData, setCookie } from "@helper";
function SignIn({ callAPI }) {

  const inputRef = useRef({});
  const router = useRouter();

  const handleLogin = async () => {
    let inputData = getInputData(inputRef);
    if (!inputData.isInvalid) {
      const data = await callAPI(apiPath.login, inputData.data);
      if (data && data.errorCode == "S_SUCCESS" && data.data) {
        localStorage.setItem('token', data.data.token);
        router.push({
          pathname: "/"
        });
      }
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="form-login">
          <div className="page-login-logo text-center pt-3">
            <Image src="/img/logo2.png" width="170" height="176" />
          </div>
          <div className="form-login-container mt-2">
            <div className="row">
              <div className="col-12">
                <TextField name="username" label={msg.empCodeForLogin} require notRequireLabel ref={el => inputRef.current.username = el} />
              </div>
              <div className="col-12 mt-2">
                <TextField type="password" name="password" label={msg.password} require notRequireLabel ref={el => inputRef.current.password = el} />
              </div>
              <div className="col-12 mt-4">
                <Button onClick={handleLogin} type="primary" customLabel="เข้าสู่ระบบ" />
              </div>

            </div>
          </div>

        </div>

      </div>
      <div className="col-12 text-center mt-3">
        <span className="text-gray">Copyright 2020 © Powered by </span><a> PT </a>
      </div>
      <div className="col-12 text-center">
        <span className="text-gray">Version 1.1.5</span>
      </div>

    </div>
  )
}


export default SignIn