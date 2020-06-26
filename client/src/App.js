import React from "react";
import {render} from "react-dom";
import InputForm from "./components/InputForm";

export default function App() {
    return (
    <div className="container p-3">
        <div className="row">
            <div className="col-md-12 d-flex">
                <img style={{height: "50px"}} className="mr-3" src="/nodesample/public/HYPR_Logo.png" />
                <h2>HYPR Demo</h2>
            </div>
        </div>
        <InputForm />
        <div className="row">
            <div className="col-md-12">
                <i>Powered by HYPR</i>
            </div>
        </div>
    </div>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    render(<App />, document.querySelector('#app'));
})