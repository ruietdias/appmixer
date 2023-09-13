var BASE_URL = "http://api.findmore-consulting.appmixer.cloud";
var USERNAME = "rui.dias@findmore.eu";
var PASSWORD = "51c7/3_a7c7/ec4c1_18bccaa6_f7c7d";

if (typeof Appmixer === "undefined") {
    alert(
      "Appmixer SDK not loaded. Are you sure you pointed to the right appmixer.js SDK location?"
    );
  }
  
  // Appmixer SDK instance.
  var appmixer = new Appmixer({ baseUrl: BASE_URL });
  
  // Make instances of the Appmixer UI widgets passing the CSS selector of the container HTML element to the `el` property.
  var appmixerWidgets = {
    accounts: appmixer.ui.Accounts({ el: "#my-accounts" }),
    insightsLogs: appmixer.ui.InsightsLogs({ el: "#my-logs" }),
    flowManager: appmixer.ui.FlowManager({
      el: "#my-flow-manager",
      options: {
        menu: [
          { label: "Edit", event: "flow:open" },
          { label: "Clone", event: "flow:clone" },
          { label: "Share", event: "flow:share" },
          { label: "Insights", event: "flow:insights" },
          { label: "Delete", event: "flow:remove" },
        ],
      },
    }),
    designer: appmixer.ui.Designer({
      el: "#my-designer",
      options: {
        menu: [
          { label: "Rename", event: "flow:rename" },
          { label: "Insights Logs", event: "flow:insights-logs" },
          { label: "Clone", event: "flow:clone" },
          { label: "Share", event: "flow:share" },
          { label: "Export to SVG", event: "flow:export-svg" },
          { label: "Export to PNG", event: "flow:export-png" },
          { label: "Print", event: "flow:print" },
        ],
        // buttons in the toolbar
        toolbar: [
          ["undo", "redo"],
          ["zoom-to-fit", "zoom-in", "zoom-out"],
          ["logs"],
        ],
      },
    }),
  };
  
  // First try to authenticate the user with the USERNAME/PASSWORD provided.
  appmixer.api
    .authenticateUser(USERNAME, PASSWORD)
    .then(function (auth) {
      appmixer.set("accessToken", auth.token);
      start();
    })
    .catch(function (error) {
      if (error.response && error.response.status === 403) {
        // Virtual user not yet created in Appmixer. Create one.
        appmixer.api
          .signupUser(USERNAME, PASSWORD)
          .then(function (auth) {
            return appmixer.api
              .authenticateUser(USERNAME, PASSWORD)
              .then(function (auth) {
                appmixer.set("accessToken", auth.token);
                // This is the first time this user access their flow manager.
                // Let's populate their workspace with some sample flows.
                createDemoFlowTemplates();
                start();
              });
          })
          .catch(function (error) {
            console.error("Something went wrong.", error);
          });
      } else {
        console.error("Something went wrong.", error);
      }
    });
  
  var btnMenuFlows = document.querySelector("#btn-menu-flows");
  var btnMenuAccounts = document.querySelector("#btn-menu-accounts");
  var btnMenuLogs = document.querySelector("#btn-menu-logs");
  
  btnMenuFlows.addEventListener(
    "click",
    function (evt) {
      unselectMenuItems();
      selectMenuItem(evt.target);
      openFlowManager();
    },
    false
  );
  btnMenuAccounts.addEventListener(
    "click",
    function (evt) {
      unselectMenuItems();
      selectMenuItem(evt.target);
      openAccounts();
    },
    false
  );
  btnMenuLogs.addEventListener(
    "click",
    function (evt) {
      unselectMenuItems();
      selectMenuItem(evt.target);
      openLogs();
    },
    false
  );
  
  function start() {
    // appmixer.set('theme', {});
    // Learn more about themes at https://docs.appmixer.com/appmixer/customizing-ui/custom-theme.
  
    appmixerWidgets.flowManager.on("flow:create", function () {
      // Create Flow button was clicked in FlowManager.
      // Show the built-in loader UI widget.
      appmixerWidgets.flowManager.state("loader", true);
      // Create an empty flow.
      appmixer.api
        .createFlow("New flow")
        .then(function (flowId) {
          // Hide loder since we're done with async calls.
          appmixerWidgets.flowManager.state("loader", false);
          // Open designer on the newly created flow.
          openDesigner(flowId);
        })
        .catch(function (error) {
          // Display built-in error message (or use your own custom error UI instead).
          appmixerWidgets.flowManager.state("error", "Creating flow failed.");
        });
    });
    appmixerWidgets.flowManager.on("flow:open", function (flowId) {
      // A flow was clicked in the flow manager. Open the Designer.
      openDesigner(flowId);
    });
  
    // An example of customizing the strings.
    // Learn more about custom strings at https://docs.appmixer.com/appmixer/customizing-ui/custom-strings.
    appmixer.set("strings", {
      ui: {
        accounts: {
          header: {
            title: "Connected Accounts",
          },
          list: {
            usedInFlows: {
              messageUsedInFlows:
                "Used in {{flowsCount}} workflow|Used in {{flowsCount}} workflows",
              messageNotUsed: "Not used in any workflow",
            },
          },
        },
      },
    });
  }
  
  // UI helpers
  // ----------
  
  function selectMenuItem(el) {
    el.classList.add("selected");
    var welcomePage = document.querySelector(".welcome-page");
    welcomePage.style.display = "none";
    if (BASE_URL === "YOUR_APPMIXER_API_URL") {
      alert(
        "Your demo is not yet configured. Please follow the steps on the homepage of this demo."
      );
      window.location.reload();
    }
  }
  
  function unselectMenuItems() {
    var selected = document.querySelectorAll("li.selected");
    for (var i = 0; i < selected.length; i++) {
      selected[i].classList.remove("selected");
    }
    hideDemoWarning();
  }
  
  function closeAll() {
    appmixerWidgets.accounts.close();
    appmixerWidgets.insightsLogs.close();
    appmixerWidgets.flowManager.close();
    appmixerWidgets.designer.close();
  }
  
  function openFlowManager() {
    closeAll();
    appmixerWidgets.flowManager.open();
  }
  function openDesigner(flowId) {
    closeAll();
    appmixerWidgets.designer.set("flowId", flowId);
    appmixerWidgets.designer.open();
    showDemoWarning();
  }
  function openAccounts() {
    closeAll();
    appmixerWidgets.accounts.open();
  }
  function openLogs() {
    closeAll();
    appmixerWidgets.insightsLogs.open();
  }
  
  function showDemoWarning() {
    var demoWarning = document.querySelector(".demo-warning");
    demoWarning.style.display = "inline-block";
  }
  
  function hideDemoWarning() {
    var demoWarning = document.querySelector(".demo-warning");
    demoWarning.style.display = "none";
  }
  
  function createDemoFlowTemplates() {
    DEMO_FLOW_TEMPLATES.forEach(function (template) {
      appmixer.api
        .createFlow(template.name, template.flow)
        .then(function (flowId) {
          appmixer.api.updateFlow(flowId, { thumbnail: template.thumbnail });
        });
    });
  }
  