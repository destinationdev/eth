App = {
  web3Provider: null,
  contracts: {},
  store: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(App.web3Provider);
      return App.initContract();
    } else {
      App.renderNoWeb3();
    }
  },

  initContract: function() {
    $.getJSON('public/Enrollment.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var EnrollmentArtifact = data;
      App.contracts.Enrollment = TruffleContract(EnrollmentArtifact);

      // Set the provider for our contract
      App.contracts.Enrollment.setProvider(App.web3Provider);

      return App.fetchContractData();
    });
    return App.bindEvents();
  },

  checkEnrollment: function() {
    return new Promise((resolve, reject) => {
      App.contracts.Enrollment.deployed().then((instance) => {
        return instance.students(web3.eth.accounts[0]);
      }).then((val) => {
        if (val[0] !== "0x0000000000000000000000000000000000000000") {
          App.renderThankYou();
        }
        App.renderMainContent();
        resolve();
      }).catch((e) => {
        App.renderContractError();
      });
    });
  },

  renderThankYou: function() {
    $("#enrollment-div").html(`
      <p>
        Thanks for enrolling! We've received your payment </br> and we'll send you an email confirmation shortly.
      </p>
    `);
  },

  renderSpinner: function() {
    $("#enrollment-div").html(`
      <div class="la-ball-grid-pulse la-2x text-center">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    `);
  },

  renderError: function(errContent) {
    $('#error-msg').show();
  },

  renderNoWeb3: function() {
    $('.content-container').hide();
    $('.no-web3').show();
  },

  renderContractError: function() {
    $('.content-container').hide();
    $('.no-contract').show();
  },

  renderMainContent: function() {
    $('.content-container').show();
  },

  fetchContractData: function() {
    App.checkEnrollment().then(() => {
      App.fetchMaxSeats()
        .then(() => App.fetchClassSize())
        .then(() => App.populateClassSize());
      App.fetchUsdTuition()
        .then(() => App.fetchWeiTuition())
        .then(() => App.populateTuition());
    });
  },

  fetchMaxSeats: function() {
    return new Promise((resolve, reject) => {
      App.contracts.Enrollment.deployed().then((instance) => {
        return instance.maxSeats();
      }).then((val) => {
        App.store.maxSeats = val.toFixed();
        resolve();
      });
    });
  },

  fetchClassSize: function() {
    return new Promise((resolve, reject) => {
      App.contracts.Enrollment.deployed().then((instance) => {
        return instance.classSize();
      }).then((val) => {
        App.store.classSize = val.toFixed();
        resolve();
      });
    });
  },

  fetchUsdTuition: function() {
    return new Promise((resolve, reject) => {
      App.contracts.Enrollment.deployed().then((instance) => {
        return instance.usdTuition();
      }).then((val) => {
        App.store.usdTuition = val.toFixed();
        resolve();
      });
    });
  },

  fetchWeiTuition: function() {
    return new Promise((resolve, reject) => {
      App.contracts.Enrollment.deployed().then((instance) => {
        return instance.weiTuition();
      }).then((val) => {
        App.store.weiTuition = val.toFixed();
        resolve();
      });
    });
  },

  populateClassSize: function() {
    $("#class-size").html(`
      <h3>${App.store.classSize}/${App.store.maxSeats} students enrolled. ${App.store.maxSeats - App.store.classSize} spots remaining!</h3>
    `);
  },

  populateTuition: function() {
    var ethTuition = (parseInt(App.store.weiTuition) / 1000000000000000000).toFixed(2);
    $("#tuition").html(`
      <h3>Price: \$${App.store.usdTuition} USD (${ethTuition} ETH)</h3>
    `);
  },

  bindEvents: function() {
    $('#enrollment-form').on('submit', function (event) {
      var formArray = $(this).serializeArray();
      App.enroll(formArray[0]['value']);
      event.preventDefault();
    });
  },

  enroll: function(name) {
    App.contracts.Enrollment.deployed().then((instance) => {
      App.renderSpinner();
      return instance.enroll(name,{from: web3.eth.accounts[0], value: App.store.weiTuition})
    }).then(() => {
      App.fetchContractData();
    }).catch((error) => {
      App.renderError();
    });
  }
};

$(function() {
  $(document).ready(function() {
    App.init();
  });
});
