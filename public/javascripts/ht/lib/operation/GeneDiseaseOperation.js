
/**
 * A custom event to fire every time a function in a rule is completed (as all
 * of them will be asynchronous).
 * rfe = Ext.create('RuleOperation', {
 * 	evName: 'event name',
 * 	listeners: {
 *  	operationComplete: function () {
 *      // some business logic
 *    }
 *  }
 * })
 *
 * /////
 * rfe.fireEvent('operationComplete');
 */
Ext.define('HT.lib.operation.GeneDiseaseOperation', {
	// extend: 'Ext.util.Observable',
	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor: function (config) {
		// this.initConfig(config);

		this.evName = 'operationComplete';
		this.alias = 'gene-disease-operation';
		this.result = null;
		this.threshold = null;

		this.mixins.observable.constructor.call(this, config);
		this.addEvents({
			'operationCompleted': true
		});

		this.listeners = config.listeners;
		this.callParent(arguments);

	},

	/**
	 * Sets if the gene is related to the disease
	 * @param {Object} edgeSrc the edge object for the source node (compound)
	 * @param {Object} edgeTrg the edge object for the target node (gene)
	 * @param {Float} threshold the value threshold
	 * @param {Function} funcObj the function object {alias, threshold, result} to hold the result
	 */
	operation: function (edgeSrc, edgeTrg, threshold, funcObj) {
		var me = this;
		var diseaseName = edgeTrg.label;
		var payloadSrc = edgeSrc.payloadValue;
		var payloadTrg = edgeTrg.payloadValue;
		// var geneParam = payloadSrc.genes.split(',')[0];
		var geneParam = edgeSrc.label.split(',')[0]; // first gene on label
		var url = "http://"+TDGUI.Globals.Host+"/pharma/gene/diseases.jsonp?ident=" + geneParam;

		Ext.data.JsonP.request({
			url: url,

			failure: function (resp, opts) {
				funcObj.result = -1;
				console.log("GeneDiseaseOperation: impossible for "+geneParam);
				me.fireEvent('operationComplete', {
					result: funcObj.result, 
					hypothesis:	false, 
					edgeId: 'e' + edgeSrc.id + '-' + edgeTrg.id,
					msg: '<span style="color:red;font-weight:bold">[Timeout]</span> Could not complete the operation. Can try again in few seconds'
				});
			},

			success: function (resp, opts) {
				var jsonObj = resp;
				var result = false;
				var positiveCount = 0;

				var diseaseList = jsonObj.diseases; // array of activities involving the protein
				var diseaseTrgTags = edgeTrg.tags.split(',');
				var tagDiseases = [];
				Ext.each(diseaseList, function (disease, index, diseases) {

					Ext.each(diseaseTrgTags, function (tag, index, tagList) {
						if (tag !== '' && disease.indexOf(tag) != -1) {
							positiveCount++;
							tagDiseases.push(tag);
							result = result || true;
						}
					})
				});

				funcObj.result = positiveCount;

				// var result = (diseaseList.indexOf(diseaseName.toLowerCase()) != -1);
				// result = related;

				// funcObj.result = result;
				var hypothesiseResult = result !== false;

				var edgeId = 'e' + edgeSrc.id + '-' + edgeTrg.id;
				console.log('Operation finished!!!: ' + funcObj.result + ' for ' + edgeId);
				var msg = "<div class=\"wordwrap\"><span style=\"font-weight: bold;\">Gene -> Disease</span> operation<br/>('";
				msg += edgeSrc.label+"' -> '"+edgeTrg.label;
				msg += "')<br/>";
				msg += "Related diseases were found where the gene is involved in ";
				msg += "(<span style=\"font-style: italic;\">"+tagDiseases.join(', ')+"</span>)</div>";
				me.fireEvent('operationComplete', {result: funcObj.result, hypothesis:
									hypothesiseResult, edgeId: edgeId, msg: msg});
			},

			scope: me
		})
	}

});

