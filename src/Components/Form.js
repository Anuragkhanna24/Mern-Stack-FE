import React, { useEffect, useState } from 'react'
import { MdOutlineFileUpload } from "react-icons/md";
import { MdAddBox } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import JSZip from "jszip";
import $, { data, valHooks } from "jquery";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const RegistrationForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [residentialStreet1, setResidentialStreet1] = useState('');
    const [residentialStreet2, setResidentialStreet2] = useState('');
    const [permanentStreet1, setPermanentStreet1] = useState('');
    const [permanentStreet2, setPermanentStreet2] = useState('');
    const [sameAsResidential, setSameAsResidential] = useState(false);
    // const [documents, setDocuments] = useState([]);
    const [dateError, setDateError] = useState('');
    const [fileName, setFileName] = useState('');
    const [formData1, setFormData] = useState([
        { fileName: '', fileType: '', uploadFile: null, uploadfilename: '' }
    ]);
    const [fileType, setFileType] = useState('');
    const [uploadbase64, setUploadbase64] = useState("")
    const [uploadfilename, setUploadFilename] = useState("")
   

    const handleAddData = () => {
        setFormData([...formData1, { fileName: '', fileType: '', uploadFile: null, uploadfilename: '' }]);
    };

    const handleChange = (index, e) => {
        const { name, value, files } = e.target;
        const newData = [...formData1];

        // If it's a file input, handle file upload
        if (name === 'uploadFile') {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                newData[index]['uploadfilename'] = file.name;
                newData[index]['uploadFile'] = event.target.result;
                setFormData(newData);
            };
            reader.readAsDataURL(file);
        } else {
            newData[index][name] = value;
            setFormData(newData);
        }
    };

    const handleRemoveData = (index) => {
        const newData = [...formData1];
        newData.splice(index, 1);
        setFormData(newData);
    };



    const removeprofilephoto = () => {
        setUploadFilename('')
        setUploadbase64('')
    };

    const handleCheckboxChange = (e) => {
        setSameAsResidential(e.target.checked);
        if (e.target.checked) {
            setPermanentStreet1(residentialStreet1);
            setPermanentStreet2(residentialStreet2);
        } else {
            setPermanentStreet1('');
            setPermanentStreet2('');
        }
    };

    const SubmitFormData = (e) => {
        console.log(formData1, 'formdata')
       
        if (!firstName) {
            toast.error("Enter First Name");
        } else if (!lastName) {
            toast.error("Enter Last Name");
        } else if (!email) {
            toast.error("Enter Email");
        } else if (!dateOfBirth) {
            toast.error("Date of birth is required");
        } else if (!residentialStreet1) {
            toast.error("Enter Residential Street 1");
        } else if (!residentialStreet2) {
            toast.error("Enter Residential Street 2");
        }  else {

            const dob = new Date(dateOfBirth);
            const today = new Date();
            const ageDiff = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            const isBeforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate());
            const age = isBeforeBirthday ? ageDiff - 1 : ageDiff;


            if (age < 18) {
                toast.error("You must be at least 18 years old to submit the form");
            } else {

                const formData = new FormData();
                formData.append('firstName', firstName);
                formData.append('lastName', lastName);
                formData.append('email', email);
                formData.append('dateOfBirth', dateOfBirth);
                formData.append('residentialStreet1', residentialStreet1);
                formData.append('residentialStreet2', residentialStreet2);
                formData.append('permanentStreet1', permanentStreet1);
                formData.append('permanentStreet2', permanentStreet2);
              // Append formData1
    // formData1.forEach((item, index) => {
    //     formData.append(`fileName${index}`, item.fileName);
    //     formData.append(`fileType${index}`, item.fileType);
    //     formData.append(`uploadFile${index}`, item.uploadFile);
    // });
    formData.append('formData1', JSON.stringify(formData1))

                axios.post("http://localhost:8000/users", formData) //api
                    .then((res) => {
                        if (res.data.code == 200 && res.data.status == "Success") {
                            toast.success("Submit Successfully")
                            removeprofilephoto();

                        } else if (res.data.code === "201" && res.data.status === "fail") {
                            toast.error("Fail");
                        } else {
                            toast.error(res.data.message);
                        }
                    })
                    .catch((err) => {
                        console.error('Error:', err);
                        toast.error("Failed to submit the form");
                    });
            }
        }
    };


    // const handleDateChange = (e) => {
    //     const selectedDate = new Date(e.target.value);
    //     const today = new Date();
    //     const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    //     if (selectedDate > minAgeDate) {
    //         setDateError('You must be at least 18 years old.');
    //     } else {
    //         setDateError('');
    //         setDateOfBirth(e.target.value);
    //     }
    // };




    const handleFileInputChange1 = (e) => {
        const myfile = e.target.files;

        if (myfile.length === 1) {
            const file = myfile[0];
            if (file.type === 'application/pdf') {

                if (file.size > 26214400) { // 25 MB
                    toast.error("PDF size should not exceed 25 MB!");
                    return;
                }
            } else if (file.type.match(/image\/.*/)) {

                if (file.size > 1048576) {
                    toast.error("Image file size exceed!");
                    return;
                }
            } else {

                toast.error("Only PDF and image files are allowed!");
                return;
            }

            console.log(file);
            setUploadFilename(file.name)
            setUploadbase64(file)

        } else if (myfile.length > 1) {
            var zip = new JSZip();
            for (let i = 0; i < myfile.length; i++) {
                zip.file(myfile[i].name, myfile[i], {
                    base64: true,
                });
            }
            zip
                .generateAsync({
                    type: "blob",
                })
                .then((content) => {
                    if (content.size > 104857600) {
                        toast.error("File size should not exceed 100 MB!");
                    } else {


                        setUploadFilename("download.zip")
                        setUploadbase64(content)

                    }
                });

        } else {
            toast.error("File cannot be null!");
        }
    };

    return (
        <div className='container'>
            <form >
                <h1>MERN STACK MACHINE TEST</h1>
                <div className='row my-4'>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start'>
                        <label>First Name<sup className='text-danger fw-bolder'>*</sup></label>
                        <input type='text' placeholder='Enter yout first name here.' className='form-control' onChange={(e) => { setFirstName(e.target.value) }} required></input>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start'>
                        <label className=''>Last Name<sup className='text-danger fw-bolder'>*</sup></label>
                        <input type='text' placeholder='Enter yout last name here.' className='form-control' onChange={(e) => { setLastName(e.target.value) }} required></input>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start my-3'>
                        <label>E-mail<sup className='text-danger fw-bolder'>*</sup></label>
                        <input type="email" className="form-control" id="exampleInputEmail1" placeholder='ex: myname@example.com' onChange={(e) => { setEmail(e.target.value) }} required></input>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start my-3'>
                        <label>Date of Birth<sup className='text-danger fw-bolder'>*</sup></label>
                        <input type='date' placeholder='Date of Birth' className='form-control' onChange={(e) => { setDateOfBirth(e.target.value) }} required></input>
                    </div>
                    <div className='col-12 col-lg-12 text-start my-3'>
                        <label>Residential Address</label>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start my-1'>
                        <label className='text-muted'>Street 1<sup className='text-danger fw-bolder'>*</sup></label>
                        <input type='text' className='form-control' onChange={(e) => { setResidentialStreet1(e.target.value) }}></input>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start my-1'>
                        <label className='text-muted'>Street 2<sup className='text-danger fw-bolder'>*</sup></label>
                        <input type='text' className='form-control' onChange={(e) => { setResidentialStreet2(e.target.value) }}></input>
                    </div>


                </div>
                <div className='row my-4'>
                    <div className='col-12 col-lg-12 text-start my-2'>
                        <input type="checkbox" class="form-check-input " id="exampleCheck1 " onClick={handleCheckboxChange}></input>
                        <label class="form-check-label px-3" for="exampleCheck1" >Same as Residential Address</label>
                    </div>
                    <div className='col-12 col-lg-12 text-start my-3'>
                        <label>Permanent Address</label>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start my-1'>
                        <label className='text-muted'>Street 1</label>
                        <input type='text' className='form-control' value={permanentStreet1} onChange={(e) => { setPermanentStreet1(e.target.value) }}></input>
                    </div>
                    <div className='col-12 col-lg-6 col-md-6 col-sm-6 text-start my-1'>
                        <label className='text-muted'>Street 2</label>
                        <input type='text' className='form-control' value={permanentStreet2} onChange={(e) => { setPermanentStreet2(e.target.value) }}></input>
                    </div>
                </div>
                <div className='col-12 col-lg-12 text-start my-3'>
                    <label>Upload Documents</label>
                </div>


                {formData1.map((data, index) => (
                    <div key={index} className='row my-4'>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start'>
                            <label className='py-2 text-muted'>File Name<sup className='text-danger fw-bolder'>*</sup></label>
                            <input type='text' className='form-control' name='fileName' value={data.fileName} onChange={(e) => handleChange(index, e)} />
                        </div>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start'>
                            <label className='py-2 text-muted'>Type of File<sup className='text-danger fw-bolder'>*</sup></label>
                            <select className="form-select form-select-md" aria-label="Medium select example" name='fileType' value={data.fileType} onChange={(e) => handleChange(index, e)}>
                                <option value="">Select type</option>
                                <option value="img">img</option>
                                <option value="pdf">pdf</option>
                            </select>
                        </div>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start'>
                            <label className='py-2 text-muted'>Upload Document<sup className='text-danger fw-bolder'>*</sup></label>
                            <div className="input-group mb-3 border justify-content-end">
                                <input id={`choosefile-${index}`} type="file"  accept="image/jpg , image/jpeg , image/png , application/pdf" className="d-none border-0" name="uploadFile" onChange={(e) => handleChange(index, e)} />
                                <label htmlFor={`choosefile-${index}`}>
                                    <input value={data.uploadfilename} readOnly className='border-0 py-1' />
                                    <MdOutlineFileUpload className='fs-4'                                   
                                />
                                </label>
                            </div>
                        </div>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start'>
                            <button type='button' className='btn bg-none align-self-center justify-content-center pt-4 fs-2' onClick={() => handleAddData()}><MdAddBox /></button>
                            {index > 0 && <button type='button' className='btn bg-none align-self-center justify-content-center pt-4 fs-2' onClick={() => handleRemoveData(index)}><RiDeleteBin6Line /></button>}
                        </div>
                    </div>
                ))}

                {/* <div className='row my-4'>



                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start'>
                            <label className='py-2 text-muted'>File Name<sup className='text-danger fw-bolder'>*</sup></label>
                            <input type='text' className='form-control' value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                            ></input>
                        </div>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start'>
                            <label className='py-2 text-muted'>Type of File<sup className='text-danger fw-bolder'>*</sup></label>
                            <select class="form-select form-select-md" aria-label="Medium select example"
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                            >
                                <option selected>Select type</option>
                                <option value="img">img</option>
                                <option value="pdf">pdf</option>

                            </select>
                        </div>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start '>
                            <label className='py-2 text-muted'>Upload Document<sup className='text-danger fw-bolder'>*</sup></label>
                            <div class="input-group mb-3 border justify-content-end">
                                <input id='choosefile' type="file" className=" d-none border-0" onChange={(e) => handleFileInputChange1(e)}
                                    onClick={(event) => {
                                        event.target.value = null;
                                    }}
                                />

                                <label htmlFor='choosefile'> <input value={uploadfilename} readOnly className='border-0 py-1' /><MdOutlineFileUpload className='fs-4'
                                    accept="image/jpg , image/jpeg , image/png , application/pdf"
                                /></label>

                            </div>
                        </div>
                        <div className='col-12 col-lg-3 col-md-3 col-sm-3 text-start '>
                            <button type='button' className='btn bg-none align-self-center justify-content-center pt-4 fs-2'><MdAddBox /></button>
                              
                               
                                    <button type='button' className='btn bg-none align-self-center justify-content-center pt-4 fs-2' ><RiDeleteBin6Line /></button>
                            

                        </div>
                    </div> */}





                <div className='col-12 col-lg-12 my-4'>
                    <button type='button' className='btn fs-4 bg-dark text-white px-4' onClick={() => SubmitFormData()}>Submit</button>
                </div>
            </form>

        </div>
    )
}

export default RegistrationForm
