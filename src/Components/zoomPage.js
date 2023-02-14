import * as base64JS from 'js-base64';
import * as hmacSha256 from 'crypto-js/hmac-sha256';
import { Buffer } from 'buffer'
import crypto from 'crypto'
import * as encBase64 from 'crypto-js/enc-base64'
import React, { useState } from "react";
import { ZoomMtg } from '@zoomus/websdk'
const KJUR = require('jsrsasign')
// const crypto = require('crypto')

ZoomMtg.setZoomJSLib('https://source.zoom.us/2.9.7/lib', '/av')
// loads dependent assets
ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()


const ZoomPage = () => {

    const [data, setData] = useState([])
    // setup your signature endpoint here: https://github.com/zoom/meetingsdk-sample-signature-node.js
    var signatureEndpoint = ''
    // This Sample App has been updated to use SDK App type credentials https://marketplace.zoom.us/docs/guides/build/sdk-app
    var sdkKey = 'ix437JttR_mP8m32IwqK9w'
    var meetingNumber = data?.MeetingNumber ?? ""
    var role = 0
    var leaveUrl = 'https://candid-macaron-077fb4.netlify.app/'
    var userName = data?.UserName ?? ""
    var userEmail = ''
    var passWord = data?.passWord ?? ""
    // pass in the registrant's token if your meeting or webinar requires registration. More info here:
    // Meetings: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/meetings#join-registered
    // Webinars: https://marketplace.zoom.us/docs/sdk/native-sdks/web/client-view/webinars#join-registered
    var registrantToken = ''

    function getSignature(e) {
        function generateSignature(key, secret, meetingNumber, role) {

            const iat = Math.round((new Date().getTime() - 30000) / 1000)
            const exp = iat + 60 * 60 * 2
            const oHeader = { alg: 'HS256', typ: 'JWT' }

            const oPayload = {
                sdkKey: key,
                mn: meetingNumber,
                role: role,
                iat: iat,
                exp: exp,
                appKey: key,
                tokenExp: iat + 60 * 60 * 2
            }

            const sHeader = JSON.stringify(oHeader)
            const sPayload = JSON.stringify(oPayload)
            const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, secret)
            return sdkJWT
        }

        // For apps with SDK and OAuth credentials, pass in the SDK key and secret. For apps with only app credentials, pass in the client ID and secret.
        // console.log(generateSignature("ix437JttR_mP8m32IwqK9w", "q1FoZQ1eGR9WvZGd82qfFwQh2B9zkads", 86072687176, role))
        let signature = generateSignature("ix437JttR_mP8m32IwqK9w", "q1FoZQ1eGR9WvZGd82qfFwQh2B9zkads", meetingNumber, role)
        startMeeting(signature)
    }

    function startMeeting(signature) {
        document.getElementById('zmmtg-root').style.display = 'block'
        console.log(signature, "Fun");
        ZoomMtg.init({
            leaveUrl: leaveUrl,
            success: (success) => {
                console.log(success, "Succs")

                ZoomMtg.join({
                    signature: signature,
                    meetingNumber: meetingNumber,
                    userName: userName,
                    sdkKey: sdkKey,
                    userEmail: userEmail,
                    passWord: passWord,
                    // tk: registrantToken,
                    success: (success) => {
                        console.log(success)
                    },
                    error: (error) => {
                        console.log(error)
                    }
                })

            },
            error: (error) => {
                console.log(error)
            }
        })
    }

    const handleCredentials = (e) => {
        setData(prevstate => ({ ...prevstate, [e.target.name]: e.target.value }))
    }
    console.log(data);

    return (
        <div>
            <h1>Zoom Meeting SDK Sample React</h1>
            <input type="text" placeholder='Username' name='UserName' style={{ color: "#4a4a4a" }} onChange={handleCredentials} />
            <input type="number" placeholder='Metting Number' name='MeetingNumber' style={{ marginLeft: '10px', color: "#4a4a4a" }} onChange={handleCredentials} />
            <input type="password" placeholder='Password' name='passWord' style={{ marginLeft: '10px', color: "#4a4a4a" }} onChange={handleCredentials} />
            <button onClick={getSignature} style={{ marginLeft: '10px', border: "2px solid", padding: "0px 5px" }}>Join Meeting</button>
        </div>
    )
}

export default ZoomPage