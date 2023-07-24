import { useState, useRef, useEffect } from 'react';
import { Provider } from 'react-redux'
import SessionAndNavBarControl from '@components/SessionAndNavBarControl';
import PermissionControl from '@components/PermissionControl';
import CustomAlert from '@components/CustomAlert';
import { useRouter } from 'next/router'
import { useStore } from '@redux/configStore'
import { PersistGate } from 'redux-persist/integration/react';
import { mainAxios, downloadAxios } from "@utils/AxiosConfig";
import Modal from 'react-bootstrap/Modal'
import Button from "@components/Button"
import Image from 'next/image'
import { getCookie } from "@helper";
import * as types from '@redux/types'
import * as msg from '@msg'
import '@styles/globals.css'
import '@styles/style.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import download from 'downloadjs'

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
  const [isShowImg, setIsShowImg] = useState(false);
  const [imgUrl, setImgUrl] = useState("")
  const [isLoadingApi, setIsLoadingApi] = useState(0)
  let isLoadingTmp = 0
  
  const redirect = (path, data = null, changeData = true) => (dispatch) => {
    if (path) {
      if (changeData) {
        dispatch({
          type: types.SETPATHVALUE,
          payload: { path: path, value: data },
        })
      }
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
    const response = await mainAxios.post(url, reqData);
    const data = response.data;
    if (!(data && data.errorCode == "S_SUCCESS")) {
      if (data && data.errorMessage) {
        console.error(response)
        setErrorMsg(data.errorMessage);
      }
      else {
        if (response.response && response.response.status == 401) {
          setErrorMsg("Session Time Out");
          if (wrapperRef.current && wrapperRef.current.logout() instanceof Function) {
            wrapperRef.current.logout()
          }
        } else {
          setErrorMsg(msg.apiError);
        }
      }
      setIsError(true);
    }
    isLoadingTmp--
    setIsLoadingApi(isLoadingTmp)
    return data;
  }

  const downloadFromAPI = async (url, reqData) => {
    const response = await downloadAxios.post(url, reqData);
    const type = response.headers['content-type'];
    const disposition = response.headers['content-disposition'];
    var filename = "";
    if (disposition && disposition.indexOf('attachment') !== -1) {
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    download(response.data, filename, type)
    return "success"
  }

  const getPathValue = (reduxObj, path) => {
    let targetPath = path ? path : router.pathname
    return reduxObj[targetPath] ? reduxObj[targetPath] : {};
  }

  const customAlert = async (alertMsg, alertType = "A", alertFunction = null) => {
    setCustomAlertType(alertType);
    setCustomAlertFunction(() => alertFunction)
    setCustomAlertMsg(alertMsg);
    setCustomAlerShow(true);
  }
  const showImg = (imgPath) => {
    setIsShowImg(true)
    setImgUrl(imgPath)
  }
  const modifiedPageProps = {
    ...pageProps, ...{
      redirect: redirect,
      callAPI: callAPI,
      downloadFromAPI: downloadFromAPI,
      customAlert: customAlert,
      redirectAndClearValue: redirectAndClearValue,
      getPathValue: getPathValue,
      updateCurrentPathValue: updateCurrentPathValue,
      showImg: showImg
    }
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionAndNavBarControl {...modifiedPageProps} ref={wrapperRef}>
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
        <Modal show={isShowImg} onHide={() => setIsShowImg(false)} size="xl" className="modal-image">
          <img src={`${process.env.apiPath}${imgUrl}`} className="image" />
        </Modal>
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

