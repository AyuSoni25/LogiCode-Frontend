
import { useState, DragEvent } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import "../../imports/AceBuildImports";
import DOMPurify from 'dompurify';

import Languages from '../../constants/Languages';
import Themes from '../../constants/Themes';
import { socket } from '../../config/socket';

type languageSupport = {
    languageName: string,
    value: string
}

type themeStyle = {
    themeName: string,
    value: string
}

function Description({ descriptionText }: {descriptionText: string}) {


    const sanitizedMarkdown = DOMPurify.sanitize(descriptionText);


    const [activeTab, setActiveTab] = useState('statement');
    const [testCaseTab, setTestCaseTab] = useState('input');
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [theme, setTheme] = useState('monokai');
    const [submissionResponse, setSubmissionResponse] = useState('');

    async function handleSubmission() {
        try {
            console.log(code)
            console.log(language)
            const response = await axios.post("http://localhost:3000/api/v1/submissions", {
                code,
                language,
                userId: "1",
                problemId: "66c6e3b823c93ffcdbf9f1ff"
            });
            console.log(response);
            if(response.data.success){
                setSubmissionResponse('SUBMISSION_SUCCESS');
                setTimeout(()=>{
                    setSubmissionResponse('');
                }, 3000)
                socket.on("submissionPayloadResponse", (data) => {
                    const evaluation = JSON.parse(JSON.stringify(data));
                    if(evaluation.response.status == 'SUCCESS'){
                        setSubmissionResponse('EVALUATION_PASSED');
                    } else {
                        setSubmissionResponse('EVALUATION_FAILED');
                    }
                    setTimeout(()=>{
                        setSubmissionResponse('');
                    }, 3000)
                });
            }
            return response;
        } catch(error) {
            setSubmissionResponse('SUBMISSION_FAILURE');
            setTimeout(()=>{
                setSubmissionResponse('');
            }, 3000)
            console.log(error);
        }
    }

    const startDragging = (e: DragEvent<HTMLDivElement>) => {
        setIsDragging(true);
        e.preventDefault();
    }

    const stopDragging = () => {
        if(isDragging) {
            setIsDragging(false);
        }
    }

    const onDrag = (e: DragEvent<HTMLDivElement>) => {
        if(!isDragging) return;
        
        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if(newLeftWidth > 10 && newLeftWidth < 90) {
            setLeftWidth(newLeftWidth);
        }

    }

    const isActiveTab = (tabName: string) => {
        if(activeTab === tabName) {
            return 'tab tab-active';
        } else {
            return 'tab'
        }
    }

    const isInputTabActive = (tabName: string) => {
        if(testCaseTab === tabName) {
            return 'tab tab-active';
        } else {
            return 'tab';
        }
    }

    const getToastMessage = (status: string) => {
        let message:string = '';
        switch(status){
            case 'SUBMISSION_SUCCESS': 
                message = 'Submission created successfully. Your code is getting evaluated.';
                break;
            case 'SUBMISSION_FAILURE':
                message = 'Error creating submission! Please try again.';
                break;
            case 'EVALUATION_PASSED':
                message = 'Accepted.';
                break;
            case 'EVALUATION_FAILED':
                message = 'Wrong Answer!';
                break;
        }
        return message;
    }

    const getAlertTypeClass = (status:string) => {
        if(status == 'SUBMISSION_SUCCESS' || status == 'EVALUATION_PASSED'){
            return 'alert alert-success';
        }
        return 'alert alert-error';
    }

    return (
        <div 
            className='flex w-screen h-[calc(100vh-57px)]'
            onMouseMove={onDrag}
            onMouseUp={stopDragging}
            
        >

            <div className='leftPanel h-full overflow-auto' style={{ width: `${leftWidth}%`}}>

                <div role="tablist" className="tabs tabs-boxed w-3/5">
                    <a onClick={() => setActiveTab('statement')} role="tab" className={isActiveTab("statement")}>Problem Statement</a>
                    <a onClick={() => setActiveTab('editorial')} role="tab" className={isActiveTab("editorial")}>Editorial</a>
                    <a onClick={() => setActiveTab('submissions')} role="tab" className={isActiveTab("submissions")}>Submissions</a>
                </div>

                <div className='markdownViewer p-[20px] basis-1/2'>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose">
                        {sanitizedMarkdown}
                    </ReactMarkdown>
                </div>


            </div>

            <div className='divider cursor-col-resize w-[5px] bg-slate-200 h-full' onMouseDown={startDragging}></div>

            <div className='rightPanel h-full overflow-auto flex flex-col' style={{ width: `${100-leftWidth}%`}}>

                <div className='flex gap-x-1.5 justify-start items-center px-4 py-2 basis-[5%]'>
                    <div>
                        <button className="btn btn-success btn-sm" onClick={handleSubmission}>Submit</button>
                    </div>
                    <div>
                        <button className="btn btn-warning btn-sm">Run Code</button>
                    </div>
                    <div>
                        <select 
                            className="select select-info w-full select-sm max-w-xs" 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            
                            {Languages.map((language: languageSupport) => (
                                <option key={language.value} value={language.value}> {language.languageName} </option>
                            ))}
                        </select>
                    </div>
                    <div>
                    <select 
                            className="select select-info w-full select-sm max-w-xs" 
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        > 
                            {Themes.map((theme: themeStyle) => (
                                <option key={theme.value} value={theme.value}> {theme.themeName} </option>
                            ))}
                        </select>
                    </div>

                </div>
                
                <div className="flex flex-col editor-console grow-[1] ">

                    <div className='editorContainer grow-[1]'>
                        <AceEditor
                            mode={language}
                            theme={theme}
                            value={code}
                            onChange={(e: string) => setCode(e)}
                            name='codeEditor'
                            className='editor'
                            style={{ width: '100%'}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                showLineNumbers: true,
                                fontSize: 16
                            }}
                            height='100%'
                        />
                    </div>

                    { /* Collapsable test case part and toast messages*/ }
                    {submissionResponse!= '' && <div role="alert" className={getAlertTypeClass(submissionResponse)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{getToastMessage(submissionResponse)}</span>
                    </div>
                    }  
                    {submissionResponse == '' && <div className="collapse bg-base-200 rounded-none">
                        <input type="checkbox" className="peer" /> 
                        <div className="collapse-title bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
                            Console
                        </div>
                        <div className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"> 
                        <div role="tablist" className="tabs tabs-boxed w-3/5 mb-4">
                            <a onClick={() => setTestCaseTab('input')} role="tab" className={isInputTabActive('input')}>Input</a>
                            <a onClick={() => setTestCaseTab('output')} role="tab" className={isInputTabActive('output')}>Output</a>
                        </div>
                            
                            {(testCaseTab === 'input') ? <textarea rows={4} cols={70} className='bg-neutral text-white rounded-md resize-none'/> : <div className='w-12 h-8'></div>}
                        </div>
                    </div>}
                
                </div>

            </div>

        </div>
    )
}

export default Description;
