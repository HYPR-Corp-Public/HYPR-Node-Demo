import React from "react";
import {render} from "react-dom";
import InputForm from "./components/InputForm";

export default function App() {
    return (
    <div className="container p-3">
        <div className="row">
            <div className="col-md-12">
                <h2>HYPR Demo</h2>
            </div>
        </div>
        <InputForm />
    </div>
    );
}

document.addEventListener("DOMContentLoaded", () => {
    render(<App />, document.querySelector('#app'));
})