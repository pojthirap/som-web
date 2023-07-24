import { useState, useRef } from 'react';
import { Provider } from 'react-redux'
import SessionAndNavBarControl from '@components/SessionAndNavBarControl';
import PermissionControl from '@components/PermissionControl';
import CustomAlert from '@components/CustomAlert';
import { useRouter } from 'next/router'
import { useStore } from '@redux/configStore'
import { PersistGate } from 'redux-persist/integration/react';
import axios from "@utils/AxiosConfig";
import Modal from 'react-bootstrap/Modal'
import Image from 'next/image';
import * as types from '@redux/types'
import * as msg from '@msg'
import Button from "@components/Button"
import '@styles/globals.css'
import '@styles/style.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const wrapperRef = useRef({});
  const { store, persistor } = useStore(pageProps.initialReduxState)
  const [errorMsg, setErrorMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [customAlertType, setCustomAlertType] = useState("A");
  const [customAlertMsg, setCustomAlertMsg] = useState("");
  const [customAlertShow, setCustomAlerShow] = useState(false);
  const [customAlertFunction, setCustomAlertFunction] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(0)
  let isLoadingTmp = 0

  const redirect = (path, data = null) => (dispatch) => {
    if (path) {
      dispatch({
        type: types.SETPATHVALUE,
        payload: { path: path, value: data },
      })
      router.push({
        pathname: path
      })
    }
  }

  const redirectAndClearValue = (path) => (dispatch) => {
    if (path) {
      dispatch({
        type: types.REMOVEPATHVALUE,
        payload: { path: router.pathname }
      })
      router.push({
        pathname: path
      })
    }
  }

  const updateCurrentPathValue = (data = null) => (dispatch) => {
    dispatch({
      type: types.SETPATHVALUE,
      payload: { path: router.pathname, value: data }
    })
  }

  const callAPI = async (url, reqData) => {
    isLoadingTmp++
    setIsLoadingApi(isLoadingTmp)
    const data = await axios.post(url, reqData, { withCredentials: true });
    if (!(data && data.errorCode == "S_SUCCESS")) {
      if (data.errorMessage) {
        setErrorMsg(data.errorMessage);
      }
      else {
        if (data?.response?.status == 401) {
          setErrorMsg(msg.sessionTimeOut);
          wrapperRef.current.logout()
        } else {
          setErrorMsg("Error");
        }
      }
      setIsError(true);
    }
    isLoadingTmp--
    setIsLoadingApi(isLoadingTmp)
    return data;
  }

  const getPathValue = (reduxObj) => {
    return reduxObj[router.pathname] ? reduxObj[router.pathname] : {};
  }

  const customAlert = async (alertMsg, alertType = "A", alertFunction = null) => {
    setCustomAlertType(alertType);
    setCustomAlertFunction(() => alertFunction)
    setCustomAlertMsg(alertMsg);
    setCustomAlerShow(true);
  }
  const modifiedPageProps = {
    ...pageProps, ...{
      redirect: redirect,
      callAPI: callAPI,
      customAlert: customAlert,
      redirectAndClearValue: redirectAndClearValue,
      getPathValue: getPathValue,
      updateCurrentPathValue: updateCurrentPathValue
    }
  };
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionAndNavBarControl callAPI={callAPI} customAlert={customAlert} ref={wrapperRef}>
          <PermissionControl callAPIFunction={callAPI}>
            <div className={"blackScreen" + (isLoadingApi > 0 ? " show" : "")} >
              <Image src="/img/loading-buffering.gif" width="100" height="100" />
            </div>
            <Component {...modifiedPageProps} />
          </PermissionControl>
        </SessionAndNavBarControl>
        <CustomAlert
          customAlertType={customAlertType}
          customAlertMsg={customAlertMsg}
          customAlertShow={customAlertShow}
          customAlertFunction={customAlertFunction}
          closeDialog={() => setCustomAlerShow(false)}
        />
        <Modal show={isError} onHide={() => setIsError(false)}>
          <Modal.Header closeButton className="errorHeader">
            <Modal.Title>{msg.APIError}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMsg}</Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setIsError(false)} type="close"></Button>
          </Modal.Footer>
        </Modal>
      </PersistGate>
    </Provider>
  )
}
export default MyApp

