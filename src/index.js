import React from 'react';
import ReactDOM from 'react-dom';
import './list.css'
import './search.css'
import {CONF} from './utils.js'

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.onSearchWordsChange = this.onSearchWordsChange.bind(this);
    this.onSearchClick = this.onSearchClick.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  onSearchWordsChange(e) {
    this.props.handleSearchWordsChange(e.target.value)
  }

  onSearchClick() {
    this.props.handleSearchClick()
  }

  onKeyUp(e) {
    if (e.key === 'Enter') {
      this.props.handleSearchClick(e.target.value)
    }
  }

  render() {
    return <div className="search">
            <input type="text" className="searchTerm" placeholder="Put words here separated by comma"
              onChange={this.onSearchWordsChange}
              onKeyUp={this.onKeyUp}/>
            <button type="button" className="searchButton"
              onClick={this.onSearchClick}>Explore</button>
           </div>
  }
}

class PassagesBlock extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listElems = this.props.items.map((item) =>
      <Passage key={item.id} item={item}/>
    );
    const resCount = listElems ? listElems.length : 0;
    return  <div className="results-box">
              <h4>{resCount} items found</h4>
              <div>
                <ul>{listElems}</ul>
              </div>
            </div>
  }
}

function Passage(props) {
  const text = unescape(props.item.text)
  const logo_src = props.item.source_id + '.png'
  return <li>
            <div>
              <img src={logo_src} />
              <p className="text">{text}</p>
            </div>
            <p className="article_link">
              <a href={props.item.url} target="_blank">{props.item.title}  </a>
              ({props.item.date})
            </p>
        </li>
}

class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {words: [], passages: []};

      this.handleSearchWordsChange = this.handleSearchWordsChange.bind(this);
      this.handleSearchClick = this.handleSearchClick.bind(this);
    }

    handleSearchWordsChange(wordsString) {
      const words_arr = wordsString.trim().length > 0 ? wordsString.split(",").map((w) => w.trim()) : [];
      this.setState({
          words: words_arr
      })
    }

    handleSearchClick() {
      if (this.state.words.length < 1) {
        this.setState({
          passages: []
        })
      } else {
        const url = CONF.PASSAGES_URL + this.state.words.join(',');
        fetch(url)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                passages: result.results
              });
            },
            (error) => {
              alert("Error");
            }
          )
        }
    }

    render() {
        return (
          <div className="wrap">
            <React.Fragment>
               <SearchBar wordList={this.state.words.join(', ')}
                          handleSearchWordsChange={this.handleSearchWordsChange}
                          handleSearchClick={this.handleSearchClick}/>
               <PassagesBlock wordList={this.state.words}
                              items={this.state.passages}/>
            </React.Fragment>
          </div>
        )
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
