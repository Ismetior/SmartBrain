import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import './App.css';

const app = new Clarifai.App({
 apiKey: '6acaeac3e0354dd39d8a1526024188e2'
});

const particlesOptions = {
  "particles": {
    "number": {
      "value": 125,
    },
    "color": {
      "value": "#88d2e8"
    },
    "shape": {
      "type": "polygon",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      }
    },
    "opacity": {
      "value": 0.4988236076586055,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1.01095197978096,
        "opacity_min": 0.49705139005897203,
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "speed": 40,
        "size_min": 0.1,
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4988236076586055,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 8,
      "direction": "none",
      "out_mode": "bounce",
    }
  },
  "interactivity": {
    "detect_on": "window",
    "events": {
      "resize": true
    }
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user:
      {
        id: 0,
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
      this.setState({
        user:
        {
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
        }
      });
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({ box: box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => {
        if (response) {
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({ isSignedIn: false });
    }else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
      <Particles className='particles'
                   params={ particlesOptions }
                 />
        <Navigation isSignedIn={ isSignedIn } onRouteChange={ this.onRouteChange }/>
        {
        route === 'home'
        ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm onInputChange={ this.onInputChange } onButtonSubmit={ this.onButtonSubmit }/>
            <FaceRecognition box={ box } imageUrl={ imageUrl }/>
          </div>
        : (
          route === 'signin'
          ? <Signin onRouteChange={ this.onRouteChange } loadUser={this.loadUser}/>
          : <Register onRouteChange={ this.onRouteChange } loadUser={this.loadUser}/>
          )
        }
      </div>
    );
  }
}

export default App;
