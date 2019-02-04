module.exports = function(RED) {
    function HTML(config, ledStyle) { 
        return String.raw`
        	<style>
				div.led {
				    display: flex;
				    flex-direction: row;

				    justify-content: space-between;
			        align-items: center;

			        height: 100%;
				}
				span.led {
				    width: 20px;
				    height: 20px;
				    border-radius: 50%;
				    margin: 8px;
				}
			</style>
			<div class="led">
				<span class="name">` + config.label + `</span>
			    <span class="led" id="led_{{$id}}" style="` + ledStyle + `">   
			    </span>
			</div>`;
	};
	
	/** 
	 * Check for that we have a config instance and that our config instance has a group selected, otherwise report an error
	 * @param {object} config - The config instance
	 * @param {object} node - The node to report the error on
	 * @returns {boolean} `false` if we encounter an error, otherwise `true`
	 */
	function checkConfig(config, node) {
        if (!config) {
			// TODO: have to think further if it makes sense to separate these out, it isn't clear what the user can do if they encounter this besides use the explicit error to more clearly debug the code
            node.error(RED._("ui_led.error.no-config"));
            return false;
        }
        if (!config.hasOwnProperty("group")) {
            node.error(RED._("ui_led.error.no-group"));
            return false;
        }
        return true;
    }

    var ui = undefined; 
    function LEDNode(config) {
        try {
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }

            RED.nodes.createNode(this, config);                       

			var node = this;

		console.log(config.coloron);
		console.log(config.coloroff);

            var beforeEmit = function(msg, value) {
		var newmsg = {
			payload : {
			      	active: value,
			      	coloron: config.coloron,
		      		coloroff: config.coloroff
				}
		};
                return { msg: newmsg };
            };

	
            
            var initController = ($scope) => {
            	$scope.flag = true;         

            	var update = (msg) => {
	            	if (!msg) {
	            		return;
	            	}
				
			        	var value = msg.payload.active === true || msg.payload.active == 1;

					var ledStyleTemplate = (color) => {
						return `background-color: ` + color + `; box-shadow: inset #ffffff8c 0px 1px 2px, inset #00000033 0 -1px 1px 1px, inset ` + color + ` 0 -1px 3px, ` + color + ` 0 0px 6px, ` + color + ` 0 0px 6px;`
					};
					var ptr = document.getElementById("led_" + $scope.$eval('$id'));
					$(ptr).attr('style', ledStyleTemplate(value ? msg.payload.coloron : msg.payload.coloroff)
					);
	            };
                $scope.$watch('msg', update);
            };

			var ledStyleTemplate = (color) => {
				return `background-color: ` + color + `; box-shadow: inset #ffffff8c 0px 1px 2px, inset #00000033 0 -1px 1px 1px, inset ` + color + ` 0 -1px 3px;`
			};

			if (checkConfig(config, node)) {
	            var done = ui.addWidget({                   
	                node: node,    
	                format: HTML(config, ledStyleTemplate(config.coloroff)), 
	                group: config.group,
                	emitOnlyNewValues: false,  
	                templateScope: "local",
	                order: 0,
	                beforeEmit: beforeEmit,
	                initController: initController
				});
			}
        } catch(error) {
            console.log(error);		
		}
		
        node.on("close", done);
    }

    RED.nodes.registerType("ui_led", LEDNode);
}
