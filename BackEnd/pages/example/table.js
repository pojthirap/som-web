import React from 'react';
import Table from "@components/Table";
import data from './data.json'
import axios from 'axios';
import Button from "@components/Button"
import TextField from "@components/TextField"
import CriteriaCard from "@components/CriteriaCard"

export default function TableExample() {

    const [response] = React.useState(data);


    // React.useEffect(() => {
    //     const fetchPosts = async () => {
    //       const res = await axios.get('./example/data');
    //       setResponse(res.data);
    //     };

    //     fetchPosts();
    //   }, []);

    return (
        <div>
            <CriteriaCard>
                <div className="row d-flex justify-content-center">
                    <div className="col-12 col-md-6 mt-2">
                        <TextField label="Company Name"></TextField>
                    </div>
                </div>
            </CriteriaCard>

            <div className="col-12">
                <h5>แสดงผลการค้นหา</h5>
                <div>
                    <Table
                        response={response}
                    />
                </div>
            </div>
        </div>
    )
}