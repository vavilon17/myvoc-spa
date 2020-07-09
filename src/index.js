import React from 'react';
import ReactDOM from 'react-dom';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

import './list.css'
import './search.css'
import {CONF} from './utils.js'

// class SearchBar extends React.Component {
//   constructor(props) {
//     super(props);
//     this.onSearchWordsChange = this.onSearchWordsChange.bind(this);
//     this.onSearchClick = this.onSearchClick.bind(this);
//     this.onKeyUp = this.onKeyUp.bind(this);
//   }
//
//   onSearchWordsChange(e) {
//     this.props.handleSearchWordsChange(e.target.value)
//   }
//
//   onSearchClick() {
//     this.props.handleSearchClick()
//   }
//
//   onKeyUp(e) {
//     if (e.key === 'Enter') {
//       this.props.handleSearchClick(e.target.value)
//     }
//   }
//
//   render() {
//     return <div className="search">
//             <input type="text" className="searchTerm" placeholder="Put words here separated by comma"
//               onChange={this.onSearchWordsChange}
//               onKeyUp={this.onKeyUp}/>
//             <button type="button" className="searchButton"
//               onClick={this.onSearchClick}>Explore</button>
//            </div>
//   }
// }

class SearchBarWithTags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      tag: '',
      suggestions: [],
      entities: [],
      activeSuggestionIndex: -1
    };
    this.handleChange = this.handleChange.bind(this);
    this.triggerSearch = this.triggerSearch.bind(this);
    this.handleChangeInput = this.handleChangeInput.bind(this);
    this.suggestionChosen = this.suggestionChosen.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChange(tags, changed, changedIndexes) {
    const changedTag = changed[0];
    const fromSuggestions =  this.state.activeSuggestionIndex !== -1;
    this.setState({
      tags: tags,
      suggestions: [],
      activeSuggestionIndex: -1
    }, () => {
      if (!tags.includes(changedTag)) { // remove tag case
        let ents = this.state.entities;
        let entIdx = ents.indexOf(changedTag);
        if (entIdx != -1) { // if entity tag was removed we need to update state properly
          ents.splice(entIdx, 1);
          this.setState({
            entities: ents
          }, () => {
            this.triggerSearch();
          });
        } else {
          this.triggerSearch();
        }
      } else if (!fromSuggestions) { // if tag was added manually (not from suggestions)
        this.triggerSearch();
      }
    });
  }

  triggerSearch() {
    let lemmas = [];
    const ents = this.state.entities;
    this.state.tags.forEach((item) => {
      if (!ents.includes(item)) {
        lemmas.push(item);
      }
    });
    this.props.handleSearchClick(lemmas, ents);
  }

  handleChangeInput(tag) {
    this.setState({tag});
    if (tag.length > 1) {
      let url = CONF.LOOKUP_URL + tag;
      fetch(url)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
               suggestions: result,
               activeSuggestionIndex: -1
            });
          },
          (error) => {
            console.log("Error: ", error);
          }
        )
    }
  }

  suggestionChosen(item) {
    this.setState({
      tags: [...this.state.tags, item.display],
      tag: '',
      suggestions: [],
      activeSuggestionIndex: -1
    }, () => {
      if (item.type === 'entity') {
        this.setState({entities: [...this.state.entities, item.display]}, () => {
          this.triggerSearch();
        });
      } else {
        this.triggerSearch();
      }
    });
  }

  handleKeyDown(e) {
    if (e.keyCode === 27) { // ESC
      this.setState({suggestions: []});
    }
    if (e.keyCode === 40) { // DOWN
      const newActiveIdx = (this.state.activeSuggestionIndex < this.state.suggestions.length - 1) ? this.state.activeSuggestionIndex + 1 : 0
      this.setState({activeSuggestionIndex: newActiveIdx});
    }
    if (e.keyCode === 38) { // UP
      const newActiveIdx = (this.state.activeSuggestionIndex > 0) ? this.state.activeSuggestionIndex - 1 : this.state.suggestions.length - 1
      this.setState({activeSuggestionIndex: newActiveIdx});
    }
    if (e.keyCode === 13) { // ENTER
      if (this.state.activeSuggestionIndex != -1) {
          this.suggestionChosen(this.state.suggestions[this.state.activeSuggestionIndex]);
      }
    }
  }

  render() {
    let sugg_items = this.state.suggestions.map((item, idx) =>
      <div key={idx} className={idx === this.state.activeSuggestionIndex ? 'autocomplete-list-item autocomplete-active' : 'autocomplete-list-item'}
          onClick={() => this.suggestionChosen(item)}>
              {item.display}
              <span className={["autocomplete-list-item-type", item.type].join(" ")}>{item.type === 'lemma' ? item.subtype : item.type}</span>
      </div>
    );

    const inputProps = {
      placeholder: 'Add search item'
    }

    return <div className="search">
            <div className="autocomplete" onKeyDown={this.handleKeyDown}>
              <TagsInput className="searchTerm"
                  inputProps={inputProps}
                  value={this.state.tags}
                  onChange={this.handleChange}
                  inputValue={this.state.tag}
                  onChangeInput={this.handleChangeInput}
              />

              <div id="myInputautocomplete-list" className="autocomplete-items">
                {sugg_items}
              </div>
              </div>
            <button type="button" className="searchButton" onClick={this.triggerSearch}>Explore</button>
          </div>
  }
}

// class PassagesBlock extends React.Component {
//   constructor(props) {
//     super(props);
//   }
//
//   render() {
//     const listElems = this.props.items.map((item) =>
//       <Passage key={item.id} item={item}/>
//     );
//     const resCount = listElems ? listElems.length : 0;
//     return  <div className="results-box">
//               <h4>{resCount} items found</h4>
//               <div>
//                 <ul>{listElems}</ul>
//               </div>
//             </div>
//   }
// }

class SearchResults extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const listElems = this.props.items.map((item) =>
      <SearchResultItem key={item.id} item={item}/>
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

function SearchResultItem(props) {
  const img_alt = props.item.source_id + '.png';
  const img_main = props.item.type === 'passage' ? img_alt : props.item.img_url;

  return <li>
            <div>
              <img src={img_main} alt={img_alt}/>
              <p className="text">{props.item.text}</p>
            </div>
            <p className="article_link">
              <a href={props.item.url} target="_blank">{props.item.title}  </a>
              ({props.item.date})
            </p>
        </li>
}

// function Passage(props) {
//   const text = unescape(props.item.text)
//   const logo_src = props.item.source_id + '.png'
//   return <li>
//             <div>
//               <img src={logo_src} />
//               <p className="text">{text}</p>
//             </div>
//             <p className="article_link">
//               <a href={props.item.url} target="_blank">{props.item.title}  </a>
//               ({props.item.date})
//             </p>
//         </li>
// }

class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        search_query_items: {
          lemmas: [],
          entities: []
        },
        search_result_items: [],
        words: [],  // TODO: DEPRECATED
        passages: [] // TODO: DEPRECATED
      };

      // this.handleSearchWordsChange = this.handleSearchWordsChange.bind(this);
      this.handleSearchClick_new = this.handleSearchClick_new.bind(this);
      this.handleSearchClick = this.handleSearchClick.bind(this);
    }

    // handleSearchWordsChange(wordsString) {
    //   const words_arr = wordsString.trim().length > 0 ? wordsString.split(",").map((w) => w.trim()) : [];
    //   this.setState({
    //       words: words_arr
    //   })
    // }

    handleSearchClick() { // DEPRECATED
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
                passages: result.items
              });
            },
            (error) => {
              alert("Error");
            }
          )
        }
    }

    // build_url_for_articles_search(base_url, lemmas, entities) {
    //   retu url = base_url + '?';
    // }

    handleSearchClick_new(lemmas, entities) {
      console.log('Calling BE! Lemmas', lemmas, ' Entities: ', entities);
      if (lemmas.length + entities.length < 1) {
        this.setState({search_result_items: []});
      } else {
        const url = CONF.ARTICLES_SEARCH_V2 + "?lemmas=" + lemmas.join('|') + '&entities=' + entities.join('|');
        fetch(url)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                search_result_items: result.items
              });
            },
            (error) => {
              console.error(error);
            }
          )
      }
    }

    render() {
        return (
          <div className="wrap">
            <React.Fragment>
                {/*<SearchBar wordList={this.state.words.join(', ')}
                           handleSearchWordsChange={this.handleSearchWordsChange}
                           handleSearchClick={this.handleSearchClick}/> */}
               <SearchBarWithTags handleSearchClick={this.handleSearchClick_new}/>
               {/*}<PassagesBlock wordList={this.state.words}
                              items={this.state.passages}/>*/}
               <SearchResults items={this.state.search_result_items}/>
            </React.Fragment>
          </div>
        )
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);
