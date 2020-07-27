import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select'
import ItemInfoBox from './ItemInfoBox.jsx';
import PieChartBox from './PieChartBox.jsx';
import Popup from "reactjs-popup";

class VidispineAssetSearch extends Component {

  static propTypes = {
      vidispine_host: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    };

  constructor(props){
    super(props);
    this.state = {
      vidispineData: {
        hits: 0,
        entry: [],
        facet: []
      },
      pageNumber: 1,
      pageSize: 16,
      selectedOption: null,
      selectedOptionType: null,
      button: 1,
      autoRefresh: true,
      selectAllSwitch: false,
      open: false,
      sortDirection: 'desc',
      sortBy: 'jobId',
      sixteenGrey: false,
      thirtyTwoGrey: true,
      sixtyFourGrey: true,
      oneHundredAndTwentyEightGrey: true,
      searchType: 'all',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeValue = e => {
    this.setState({
      ['value'+e.target.name]: e.target.checked,
      ['id'+e.target.name]: e.target.id,
      autoRefresh: false
    });
  }

  setStatePromise(newState) {
    return new Promise((resolve,reject)=>this.setState(newState, ()=>resolve()));
  }

  async getJobData(endpoint) {
    const headers = new Headers();
    const encodedString = new Buffer(this.props.username + ":" + this.props.password).toString('base64');
    const url = this.props.vidispine_host + "/API/" + endpoint;
    await this.setStatePromise({loading: true});
    const result = await fetch(url, {headers: {Accept: "application/json", Authorization: "Basic " + encodedString}});

    switch(result.status) {
    case 200:
      const returnedData = await result.json();
      return this.setStatePromise({loading: false, vidispineData: returnedData});
    default:
      const errorContent = await result.text();
      return this.setStatePromise({loading: false, lastError: errorContent});
    }
  }

  getDataForRefresh = () => {
    if (this.state.autoRefresh) {
      this.getJobDataWrapper();
    }
  }

  getJobDataWrapper() {
    var placeToLoad = 1;
    if (this.state.pageNumber > 1) {
      placeToLoad = this.state.pageNumber * this.state.pageSize - this.state.pageSize + 1;
    }
    var selectedData = 'all';
    if (this.state.selectedOption != null) {
      selectedData = this.state.selectedOption.reduce((result, item) => {
        return `${result}${item.value},`
      }, "")
    }
    var selectedDataType = 'all';
    if (this.state.selectedOptionType != null) {
      selectedDataType = this.state.selectedOptionType.reduce((result, item) => {
        return `${result}${item.value},`
      }, "")
    }
    this.getJobData('job?metadata=true&step=true&number=' + this.state.pageSize + '&first=' + placeToLoad + '&sort=' + this.state.sortBy + '%20' + this.state.sortDirection + '&state=' + selectedData + '&type=' + selectedDataType);
  }

  componentDidMount() {
    //this.getJobData('job?metadata=true&step=true&number=16&first=1&sort=jobId%20desc');
    //setInterval(this.getDataForRefresh, 5000);
    //this.getSearchData('search?content=metadata',this.makeXML({'mediaType': 'video'}));
  }

  pageHigher = () => {
    const totalNumberOfPages = this.totalPages();

    if (this.state.pageNumber < totalNumberOfPages) {
      this.setState({
        pageNumber: this.state.pageNumber + 1,
        autoRefresh: true
      },() => {
        this.clearSelections();
        this.getJobDataWrapper();
      });
    }
  }

  pageLower = () => {
    if (this.state.pageNumber > 1) {
      this.setState({
        pageNumber: this.state.pageNumber - 1,
        autoRefresh: true
      },() => {
        this.clearSelections();
        this.getJobDataWrapper();
      });
    }
  }

  pageSize16 = () => {
    this.setState({
      pageSize: 16,
      autoRefresh: true,
      sixteenGrey: false,
      thirtyTwoGrey: true,
      sixtyFourGrey: true,
      oneHundredAndTwentyEightGrey: true
    },() => {
      this.clearSelections();
      this.getJobDataWrapper();
    });
  }

  pageSize32 = () => {
    const totalPages32 = Math.ceil(this.state.vidispineData.hits / 32);
    var pageNumberToSet32 = this.state.pageNumber;

    if (this.state.pageNumber > totalPages32) {
      pageNumberToSet32= totalPages32;
    }

    this.setState({
      pageSize: 32,
      pageNumber: pageNumberToSet32,
      autoRefresh: true,
      sixteenGrey: true,
      thirtyTwoGrey: false,
      sixtyFourGrey: true,
      oneHundredAndTwentyEightGrey: true
    },() => {
      this.clearSelections();
      this.getJobDataWrapper();
    });
  }

  pageSize64 = () => {
    const totalPages64 = Math.ceil(this.state.vidispineData.hits / 64);
    var pageNumberToSet64 = this.state.pageNumber;

    if (this.state.pageNumber > totalPages64) {
      pageNumberToSet64 = totalPages64;
    }

    this.setState({
      pageSize: 64,
      pageNumber: pageNumberToSet64,
      autoRefresh: true,
      sixteenGrey: true,
      thirtyTwoGrey: true,
      sixtyFourGrey: false,
      oneHundredAndTwentyEightGrey: true
    },() => {
      this.clearSelections();
      this.getJobDataWrapper();
    });
  }

  pageSize128 = () => {
    const totalPages128 = Math.ceil(this.state.vidispineData.hits / 128);
    var pageNumberToSet128 = this.state.pageNumber;

    if (this.state.pageNumber > totalPages128) {
      pageNumberToSet128 = totalPages128;
    }

    this.setState({
      pageSize: 128,
      pageNumber: pageNumberToSet128,
      autoRefresh: true,
      sixteenGrey: true,
      thirtyTwoGrey: true,
      sixtyFourGrey: true,
      oneHundredAndTwentyEightGrey: false
    },() => {
      this.clearSelections();
      this.getJobDataWrapper();
    });
  }

  placeToShow() {
    var placeToReturn = 1;
    if (this.state.pageNumber > 1) {
      placeToReturn = (this.state.pageNumber * this.state.pageSize) - this.state.pageSize + 1;
    }
    return placeToReturn;
  }

  placeToShowEnd() {
    var placeToReturnEnd = this.state.pageSize;
    if (this.state.pageNumber > 1) {
      placeToReturnEnd = (this.state.pageNumber * this.state.pageSize) + 1;
    }
    if (placeToReturnEnd > this.state.vidispineData.hits) {
      placeToReturnEnd = this.state.vidispineData.hits;
    }
    return placeToReturnEnd;
  }

  totalPages() {
    var totalToReturn = 1;
    totalToReturn = Math.ceil(this.state.vidispineData.hits / this.state.pageSize);
    return totalToReturn;
  }

  changeSort(input) {
    if (this.state.sortDirection == 'desc') {
      this.state.sortDirection = 'asc';
    } else {
      this.state.sortDirection = 'desc';
    }
    this.state.sortBy = input;
    this.clearSelections();
    this.getJobDataWrapper();
  }

  returnCSSForPageSize(pageSizeInput) {
    if (pageSizeInput == 16) {
      if (this.state.sixteenGrey) {
        return "size_button_16_grey";
      }
    }
    if (pageSizeInput == 32) {
      if (this.state.thirtyTwoGrey) {
        return "size_button_32_grey";
      } else {
        return "size_button_32";
      }
    }
    if (pageSizeInput == 64) {
      if (this.state.sixtyFourGrey) {
        return "size_button_64_grey";
      } else {
        return "size_button_64";
      }
    }
    if (pageSizeInput == 128) {
      if (this.state.oneHundredAndTwentyEightGrey) {
        return "size_button_128_grey";
      } else {
        return "size_button_128";
      }
    }
    return "size_button_16";
  }

  handleSubmit(event) {
    event.preventDefault();
    var dictionaryToSendToMakeXML = {};
    if (this.element_category.value != '') {
      dictionaryToSendToMakeXML['gnm_asset_category'] = this.element_category.value;
    }
    if (this.element_title.value != '') {
      dictionaryToSendToMakeXML['title'] = this.element_title.value;
    }
    if (this.element_description.value != '') {
      dictionaryToSendToMakeXML['gnm_asset_description'] = this.element_description.value;
    }
    //if (this.element_keywords.value != '') {
      //dictionaryToSendToMakeXML['gnm_asset_keywords'] = this.element_keywords.value;
    //}
    if (this.element_keywords.value != '') {
      const keywordsArray = this.element_keywords.value.split(' ');
      var keywordNumber = 1;
      for (const [index, keyword] of keywordsArray.entries()) {
        dictionaryToSendToMakeXML[`keyword${keywordNumber}`] = keyword;
        keywordNumber++;
      }
    }
    if (this.element_archive_status.value != '') {
      dictionaryToSendToMakeXML['gnm_external_archive_external_archive_status'] = this.element_archive_status.value;
    }
    if (this.element_production_office.value != '') {
      dictionaryToSendToMakeXML['gnm_master_generic_production_office'] = this.element_production_office.value;
    }
    if (this.element_atom.value != '') {
      dictionaryToSendToMakeXML['gnm_master_mediaatom_atomid'] = this.element_atom.value;
    }
    if (this.element_octopus.value != '') {
      dictionaryToSendToMakeXML['gnm_master_generic_titleid'] = this.element_octopus.value;
    }
    if (this.element_project.value != '') {
      dictionaryToSendToMakeXML['gnm_project'] = this.element_project.value;
    }
    if (this.element_reference.value != '') {
      dictionaryToSendToMakeXML['gnm_asset_filming_location'] = this.element_reference.value;
    }
    if (this.element.value != '') {
      dictionaryToSendToMakeXML['originalFilename'] = this.element.value;
    }
    //alert(this.state.searchType);

    //alert(dictionaryToSendToMakeXML);

    this.getSearchData('search?content=metadata',this.makeXML(dictionaryToSendToMakeXML, this.state.searchType));
    //this.getSearchData('search?content=metadata',this.makeXML({'originalFilename': this.element.value, 'title': this.element_title.value}));
  }

  makeXML(inputDictionary, inputSearchType) {
    var outputString = '<ItemSearchDocument xmlns="http://xml.vidispine.com/schema/vidispine">'
    if (inputSearchType == 'any') {
      outputString += '<operator operation="OR">'
    }
    for(var key in inputDictionary) {
      var value = inputDictionary[key];
      if ((key == 'keyword1') || (key == 'keyword2') || (key == 'keyword3') || (key == 'keyword4') || (key == 'keyword5') || (key == 'keyword6') || (key == 'keyword7') || (key == 'keyword8') || (key == 'keyword9') || (key == 'keyword10')) {
        outputString += '<field><name>gnm_asset_keywords</name><value>*' + value + '*</value></field>';
      } else {
        outputString += '<field><name>' + key + '</name><value>' + value + '</value></field>';
      }
    }
    if (inputSearchType == 'any') {
      outputString += '</operator>'
    }

    outputString += '<facet count="true"><field>mediaType</field></facet><facet count="true"><field>gnm_asset_category</field></facet><facet count="true"><field>gnm_master_generic_source</field></facet><facet count="true"><field>gnm_storage_rule_deletable</field></facet></ItemSearchDocument>';
    console.log(outputString);
    return outputString;
  }

  async getSearchData(endpoint,xML) {
    const headers = new Headers();
    const encodedString = new Buffer(this.props.username + ":" + this.props.password).toString('base64');
    const url = this.props.vidispine_host + "/API/" + endpoint;
    await this.setStatePromise({loading: true});
    const result = await fetch(url, {method: 'PUT', headers: {Accept: "application/json", 'Content-Type': 'application/xml', Authorization: "Basic " + encodedString}, body: xML});

    switch(result.status) {
    case 200:
      const returnedData = await result.json();
      return this.setStatePromise({loading: false, vidispineData: returnedData});
    default:
      const errorContent = await result.text();
      return this.setStatePromise({loading: false, lastError: errorContent});
    }
  }

  setSearchType(event) {
    this.state.searchType = event.target.value;
  }

  render() {
    const { selectedOption } = this.state;
    const { selectedOptionType } = this.state;

    return (
      <div>
        <div class="search_grid">
          <div class="search_title_box">Vidispine Asset Search</div>
          <div class="items_top_area">
          <form class="main_form" onSubmit={this.handleSubmit}>
            <div class="form_box">
              <div class="form_title">
                Category:
              </div>
              <div class="form_input">
                <select ref={el => this.element_category = el}>
                  <option value="">(any)</option>
                  <option value="Reuters">Reuters Package</option>
                  <option value="ReutersLive">Reuters Live</option>
                  <option value="ITN">ITN Master</option>
                  <option value="Rushes">Guardian Rushes</option>
                  <option value="Master">Guardian Master</option>
                  <option value="RemoteFootage">Remotely Uploaded</option>
                  <option value="Australia">Guardian Australia Master</option>
                  <option value="US">Guardian US Masters</option>
                  <option value="Remote">Remote Masters</option>
                  <option value="Podcasts">Guardian Podcasts</option>
                  <option value="Legacy">Legacy Masters</option>
                  <option value="Getty Stock">Getty Stock</option>
                  <option value="ITN Source">ITN Source</option>
                  <option value="Universal Music">Universal Music</option>
                  <option value="Branding">Guardian Branding</option>
                  <option value="Completed Project">Completed Project (Legacy)</option>
                  <option value="Master Video">Master (Legacy)</option>
                  <option value="Guardian Rushes">Guardian Rushes (Legacy)</option>
                  <option value="Master from Archive">Master (Pre-Octopus)</option>
                  <option value="Guardian Australia">Guardian Australia (Legacy)</option>
                  <option value="Guardian Pipeline">Guardian Pipeline (Legacy)</option>
                  <option value="Not Provided">Not Provided</option>
                  <option value="Remotely Uploaded">Remotely Uploaded (Legacy)</option>
                </select>
              </div>
              <div class="form_title">
                Title:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element_title = el} />
              </div>
              <div class="form_title">
                Description:
              </div>
              <div class="form_input">
                <textarea class="standard_textarea" ref={el => this.element_description = el}></textarea>
              </div>
              <div class="form_title">
                Keywords:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element_keywords = el} />
              </div>
              <div class="form_title">
                Archive status:
              </div>
              <div class="form_input">
                <select ref={el => this.element_archive_status = el}>
                  <option value="">(any)</option>
                  <option value="Not In External Archive">Not In External Archive</option>
                  <option value="Upload in Progress">Upload in Progress</option>
                  <option value="Upload Failed">Upload Failed</option>
                  <option value="Awaiting Verification">Awaiting Verification</option>
                  <option value="Archived">Archived</option>
                  <option value="Restore in Progress">Restore in Progress</option>
                  <option value="Restore Failed">Restore Failed</option>
                  <option value="Restore Completed">Restore Completed</option>
                </select>
              </div>
              <div class="form_title">
                Production office:
              </div>
              <div class="form_input">
                <select ref={el => this.element_production_office = el}>
                  <option value="">(any)</option>
                  <option value="UK">UK</option>
                  <option value="US">US</option>
                  <option value="AUS">AUS</option>
                </select>
              </div>
              <div class="form_title">
                Atom id.:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element_atom = el} />
              </div>
              <div class="form_title">
                Octopus id.:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element_octopus = el} />
              </div>
              <div class="form_title">
                Parent project:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element_project = el} />
              </div>
              <div class="form_title">
                Project reference:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element_reference = el} />
              </div>
              <div class="form_title">
                Filename:
              </div>
              <div class="form_input">
                <input class="standard_input" type="text" ref={el => this.element = el} />
              </div>
              <div class="form_title">
                Search type:
              </div>
              <div class="form_type" onChange={this.setSearchType.bind(this)}>
                <div class="form_type_left">
                  <input type="radio" id="all" name="search_type" value="all" /> Contains ALL data
                </div>
                <div class="form_type_right">
                  <input type="radio" id="any" name="search_type" value="any" /> Contains ANY data
                </div>
              </div>
              <div class="form_search">
                <input onClick={() => (this.state.button = 2)} class="search_button" type="submit" value="Search" onclick="clicked='Go'"/>
              </div>
            </div>
          </form>
          <div class="right_box">
            <div class="hits_display">
            {
              this.state.vidispineData.hits != '' ? (
                <div>Found {this.state.vidispineData.hits} items</div>
              ) : (
                <div></div>
              )
            }
            </div>

            {
              this.state.vidispineData.facet && this.state.vidispineData.facet.length > 0 ? (
              this.state.vidispineData.facet.map((item, i) =><PieChartBox mapPlace={i} chartData={item} chartName={item.field} vidispineHost={this.props.vidispine_host} />)
            ) : (
              <div></div>
            )

            }

          </div>

           {
             this.state.vidispineData.entry && this.state.vidispineData.entry.length > 0 ? (
             this.state.vidispineData.entry.map((item, i) =><ItemInfoBox mapPlace={i} itemData={item} itemId={item.id} vidispineHost={this.props.vidispine_host} />)
           ) : (
             <div class="no_jobs_found">No items found</div>
           )
             //this.state.vidispineData.job && this.state.vidispineData.job.length > 0 ? (
             //this.state.vidispineData.job.map((item, i) =><JobInfoBox mapPlace={i} jobData={item} jobId={item.jobId} value={this.state[`value${i}`]} onChangeValue={this.handleChangeValue}/>)
           //) : (
             //<div class="no_jobs_found">No jobs found</div>
           //)
            }
          </div>
        </div>
      </div>
    )
  }
}

export default VidispineAssetSearch;
