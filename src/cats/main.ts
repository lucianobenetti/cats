//
// Copyright (c) JBaron.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

var PATH = require("path");
var GUI = require('nw.gui');

// GLOBAL variable used for accessing the singleton IDE instance
var IDE: Cats.Ide;

/**
 * Main module of the CATS IDE
 */
module Cats {

    /**
     * Get a parameter from the URL. This is used when a new project is opened from within
     * the IDE and the project name is passed s a parameter
     */
    function getParameterByName(name: string): string {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);
        if (results == null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }

    /**
     * Determine which project(s) we should load during 
     * startup. This is used when the IDE is started from the command line
     */
    function determineProject(): string {
        var projectName = getParameterByName("project");
        if (!projectName) {
            var args = GUI.App.argv;
            var i = args.indexOf("--project");
            if (i > -1) projectName = args[i + 1];
        }
        return projectName;
    }

    // Catch unhandled expections so they don't showup in the IDE.
    process.on("uncaughtException", function(err: any) {
        console.error("Uncaught exception occured: " + err);
        console.error(err.stack);
        if (IDE.console) IDE.console.error(err.stack);
    });


    /**
     * This is the functions that start kicks it all of. When Qooxdoo is loaded it will 
     * call this main to start the application 
     */
    function main(app: qx.application.Standalone) {

        var args = GUI.App.argv;
        if (args.indexOf("--debug") === -1) {
            console.info = function() { /* NOP */};
            console.debug = function() { /* NOP */};
        } 
        
        IDE = new Cats.Ide();
        if (args.indexOf("--debug") > -1) {
            IDE.debug = true;
        }

        var map:IMap = {
            "project_settings" : "Project Setting"
        };

        qx.locale.Manager.getInstance().setLocale("en");
        qx.locale.Manager.getInstance().addTranslation("en", map);

        IDE.init(<qx.ui.container.Composite>app.getRoot());

        var prjName = determineProject();
        if (prjName) {
            IDE.addProject(new Project(prjName));
        } else {
            if (args.indexOf("--restore") > -1) IDE.restorePreviousProjects();
        }
    }

    // Register the main method that once Qooxdoo is loaded is called
    qx.registry.registerMainMethod(main);

}



