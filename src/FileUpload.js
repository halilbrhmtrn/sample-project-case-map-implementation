import React, { Component } from 'react';
import axios from 'axios';
import HereMap from './HereMap';

class FileUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            fileReady: false,
            data: null
        }

    }
    handleOnChange = (e) => {
        //this.readFile(e.target.files[0]);
        this.setState({
            selectedFile: e.target.files[0]
        })
    }
    handleOnClick = () => {
        const data = new FormData()
        data.append('file', this.state.selectedFile);
        axios.post("http://localhost:8080/processFile", data, {
        }).then(res => {
            this.setState({
                fileReady: true,
                data: res.data
            });
        })
    }
    render() {
        const { fileReady, data } = this.state;
        const template = fileReady ? (
            <div className="container">
                <HereMap data={data} />
            </div>
        ) : (
                <div className="container">
                    <div className="row">
                        <div className="col s12 m4 l8">
                            <input type="file" id="fileUpload" name="fileUpload" accept=".xls, .xlsx" onChange={this.handleOnChange} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col s12 m4 l8">
                            <button type="button" className="btn btn-success btn-block" onClick={this.handleOnClick}>Upload</button>
                        </div>
                    </div>
                </div>
            )
        return template;
    }
}

export default FileUpload;