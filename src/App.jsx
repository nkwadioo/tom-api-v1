import React, { useState, useEffect, Fragment  } from 'react';
import './App.css';


function App() {
  const [Data, setData] = useState([])
  const [Models, setModels] = useState({})
  const [ModelId, setModelId] = useState('')
  const [ModelForm, setModelForm] = useState({input: {}})
  const [Exclusions, setExclusions] = useState({rules: {}})
  const [Errors, setErrors] = useState({})
  const [Alert, setAlert] = useState({show: false, message: '', type: ''})

  const url = 'https://api.up2tom.com/v3';

  const showMessage = (message, type, time = 1400) => {
    setAlert({show: true, message, type})
    setTimeout(() => {
      setAlert({show: false, message: '', type: null})
    }, time)
  }

  const getModels = () => {
    fetch(`${url}/models`, {
      method: 'GET',
      mode: 'cors',
      crossDomain:true,
      headers: {
        'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
        'Content-type': 'application/vnd.api+json'
      }
    }).then((res) => res.json())
    .then((res) => {
      if(res.error || res.errors || !res.data) {
        showMessage('Error loading models', 'error');
        return;
      }
      setModels([...res.data])
    });
  }

  const getModelData = (event) => {
    const {value} = event.target;
    setData([])
    getData2(value);
  }

  

  const getData2 = (modelId) => {
    // try {
      if(!modelId) {
        return;
      }
      fetch(`${url}/models/${modelId}`, {
        method: 'GET',
        mode: 'cors',
        crossDomain:true,
        headers: {
          'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
          'Content-type': 'application/vnd.api+json'
        }
      })
      .then((res) => res.json())
      .then((res) => {
        if(res.error || res.errors || !res.data) {
          showMessage('Error loading model data', 'error');
          return;
        }
        const model = {...res?.data?.attributes};
        const name = model.name;
        const description = model.description;
        const exclusions = model.exclusions;
        const metadata = model.metadata;
        const prediction = metadata.prediction;
        const attributes = metadata.attributes;

        setExclusions({...exclusions})
        setData({id: res?.data?.id, name, description, prediction, attributes});
        const att = {};
        attributes.map(a => att[a.name] = '');
        setModelId(modelId);
        setModelForm({
          input: {
            [prediction.name]: '',
            ...att
          }
        });

        showMessage('Model loaded successfully', 'success');

      })   
    // } catch (err) {
      
    // }
  }

  useEffect(() => {
    getModels();
  }, [])

  const checkDecisionError = () => {
    let errors = {...Errors};
    let {rules} = Exclusions;
    const form = {...ModelForm};
    let isValid = true;
    rules.forEach(rule => {
      const {antecedent, consequent, relation, type} = rule;
      if(type === "RelationshipEx") {
        const formIndex = `INPUTVAR${relation.index + 1}`;
        const val = +form.input[formIndex]
        if(val > relation.threshold ) {
          const question = Data.attributes.filter(attr => attr.name === formIndex)[0].question;
          console.log({[formIndex]: `${question} must be less than ${relation.threshold}`})
          errors[formIndex] = `${question} must be less than ${relation.threshold}`;
          isValid = false;
        }else {
          errors[formIndex] = null;
        }
      }else if(type === "ValueEx") {
        // EQ
        antecedent.forEach((a, i) => {
          const antId = `INPUTVAR${a.index + 1}`;
          const consId =`INPUTVAR${consequent[i].index + 1}`
          const antVal = form.input[antId];
          const consVal = form.input[consId]
          const question1 = Data.attributes.filter(attr => attr.name === antId)[0].question;
          // const question2 = Data.attributes.filter(attr => attr.name === consId)[0].question;
          
          if(antVal && consVal && a.threshold === antVal && a.type === 'EQ') {
            if(consequent[i].threshold === consVal && consequent[i].type === 'EQ') {
              errors[consId] = '';
            }else {
              errors[consId] =  `${consequent[i].threshold} is only applicable for ${question1} : ${antecedent[i].threshold}`;
              isValid = false;
            }
          }
          
          if(antVal && consVal && a.threshold !== antVal && a.type === 'NEQ') {
            if(consequent[i].threshold !== consVal && consequent[i].type === 'NEQ') {
              errors[consId] = '';
            }else {
              errors[consId] =  `${consequent[i].threshold} is only applicable for ${question1} : ${antecedent[i].threshold}`;
              isValid = false;
            }
          }


        });
        
      }
    })

    setErrors({...errors});
    return isValid;
  }

  const validateForm = (name = null) => {
    const {input} = ModelForm;
    let errors = {...Errors};
    let isValid = true;
    if(name) {
      if(!input[name]) {
        return
      }
      return
    }
    Object.entries(input).forEach((entries, index) => {
      let [key, val] = entries;
      if(!val) {
        errors[key] = 'This field is required';
        isValid = false;
      }
    });
    setErrors({...errors});
    return isValid;
  }

  const handleChange = (e) => {
    const {name, value} = e.target;
    const form = {...ModelForm};
    form.input[name] = value;
    checkDecisionError();
    validateForm(name)
    setModelForm({...form});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const {input} = ModelForm;
    if(!checkDecisionError() || !validateForm()) {
      showMessage('Please fill all the required fields', 'error');
      return;
    }

    const data = {
      data: {
        type: 'scenario',
        attributes: {
          input
        }
      }
    }
    fetch(`${url}/decision/${ModelId}`, {
      method: 'POST',
      mode: 'cors',
      crossDomain:true,
      headers: {
        'Authorization': 'Token 9307bfd5fa011428ff198bb37547f979',
        'Content-type': 'application/vnd.api+json'
      },
      body: JSON.stringify(data)
    })
    .then((res) => res.json())
    .then((res) => {
      if(res.error || res.errors) {
        showMessage('Unable to submit model', 'error');
        return;
      }
      showMessage('Model submitted successfully', 'success');
      console.log(res);
    })
  }

  return (
    <div className="App">
      <div className="notification">
        {Alert.show && Alert.type === 'success' &&
          <div className="bg-green-400 opacity-100 z-10 rounded-lg border-gray-300 border p-3 shadow-lg
                      w-5/6 lg:w-3/6 ml-auto fixed top-2 right-1
                      ">
            <div className="flex flex-row">
              <div className="px-2">
              </div>
              <div className="ml-2 mr-6">
                <span className="font-semibold">Success!</span>
                <span className="block text-white">{Alert.message}</span>
              </div>
            </div>
          </div>
        }

        {Alert.show && Alert.type === 'error' &&
          <div className="bg-red-400 opacity-100 z-10 rounded-lg border-gray-300 border p-3 shadow-lg
                        w-5/6 lg:w-3/6 ml-auto fixed top-2 right-1
                        ">
            <div className="flex flex-row">
              <div className="px-2">
              </div>
              <div className="ml-2 mr-6">
                <span className="font-semibold">Error!</span>
                <span className="block text-white">{Alert.message}</span>
              </div>
            </div>
          </div>
        }
      </div>
        
      
    <>
      <nav className='shadow'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink flex content-center">
                <img
                  className="h-8 w-8"
                  src="/images/api.png"
                  alt="Workflow"
                />
                <span className='self-end'>TOM API Demo</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {/* Profile dropdown */}
                <span className="sr-only">Open user menu</span>
                <img className="h-8 w-8 rounded-full" src="/images/profile.jpg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <header className="lg:container mx-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <form className="sm:w-6/12 w-full mx-auto">
            <div className="form-group">
              <select name="prediction" onChange={getModelData}>
                <option value="">Select Model</option>
                {Models.length && 
                  Models.map((model, index) => {
                    return (
                      <option value={model.id} key={index}>{model.attributes?.name}</option>
                    )
                  })
                }
              </select>
              <label htmlFor="prediction" className='control-label'>Prediction name</label> 
              <i className="bar"></i>
            </div>
            <span className='font-thin'>{Data.description}</span>
          </form>
        </div>
      </header>
      <div className="min-h-full">
        
        <main className="lg:container mx-auto">
          <form onSubmit={handleSubmit}
                className="max-w-7xl mx-auto py-6 px-6 lg:px-8"
                noValidate>
            <div className="grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-8">
              {Data?.prediction && 
                <div className="form-group"> 
                  {Data?.prediction?.domain?.type === 'DomainC' && 
                    <select required name={Data?.prediction?.name}
                            value={ModelForm.input[Data?.prediction?.name]}
                            onChange={handleChange}>
                      <option value="">Select Option</option>
                      {Data?.prediction?.domain.values.map((v, i) => {
                        return <option key={i} value={v}>{v}</option>
                      })}
                    </select>
                  }
                  <i className="bar"></i>
                  <label htmlFor={Data?.prediction?.name} className='control-label'>{Data?.prediction?.question}</label>
                  {Errors[Data?.prediction?.name] && <span className='error'>{Errors[Data?.prediction?.name]}</span>}
                </div>
              }
              {Data?.attributes?.map((item, index) => {
                  return (
                    <div className="form-group" key={index}>
                      
                      {item.domain.type === 'DomainR' && 
                      <>
                        <i className='start index'>{item.domain.lower}</i>
                        <i className='end index float-right'>{item.domain.upper}</i>
                        <input 
                          onChange={handleChange}
                          value={ModelForm.input[item.name] || 0}
                          name={item.name}
                          type="range"
                          min={item.domain.lower}
                          max={item.domain.upper}
                          step={item.domain.interval}
                          className="transition duration-150 ease-in-out"
                          data-bs-toggle="tooltip" title={ModelForm.input[item.name] || 0}
                        />
                        {Errors[item.name] && <span className='error'>{Errors[item.name]}</span>}
                      </>
                      }
                      {item.domain.type === 'DomainC' && 
                      <>
                        <select required name={item.name} value={ModelForm.input[item.name]} onChange={handleChange}>
                          <option value="">Select Option</option>
                          {item.domain.values.map((v, i) => {
                            return <option key={i} value={v}>{v}</option>
                          })}
                        </select>
                        <i className="bar"></i>
                      </>
                      }
                      <label htmlFor={item.name} className='control-label'>{item.question}</label>
                      {Errors[item.name] && <span className='error'>{Errors[item.name]}</span>}
                    </div>
                  )
              })}

            </div>
            {Data.prediction && 
              <button type="submit" className='bg-blue-500 hover:bg-blue-600 float-right px-3 py-1'>Submit &gt; </button>
            }
            {!Data?.prediction && 
              <button type="button" className='bg-blue-200 text-gray-700 pointer-events-none float-right px-3 py-1'>Submit &gt; </button>
            }
            
          
          </form>
        </main>
      </div>

      
    </>
      
      
      

      <a href="https://www.flaticon.com/free-icons/api" title="api icons">Api icons created by Freepik - Flaticon</a>
    </div>

    
  );
}

export default App;


