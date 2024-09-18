/**
 * @class Ext.ux.AgentbarDroppable
 * @extends Object
 * Plugin which allows items to be dropped onto a agentbar and be turned into new Agentbar items.
 * To use the plugin, you just need to provide a createItem implementation that takes the drop
 * data as an argument and returns an object that can be placed onto the agentbar. Example:
 * <pre>
 * Ext.create('Ext.ux.AgentbarDroppable', {
 *   createItem: function(data) {
 *     return Ext.create('Ext.Button', {text: data.text});
 *   }
 * });
 * </pre>
 * The afterLayout function can also be overridden, and is called after a new item has been
 * created and inserted into the Agentbar. Use this for any logic that needs to be run after
 * the item has been created.
 */
 Ext.define('Ext.ux.AgentbarDroppable', {

    /**
     * @constructor
     */
    constructor: function(config) {
      Ext.apply(this, config);
    },

    /**
     * Initializes the plugin and saves a reference to the agentbar
     * @param {Ext.agentbar.Agentbar} agentbar The agentbar instance
     */
    init: function(agentbar) {
      /**
       * @property agentbar
       * @type Ext.agentbar.Agentbar
       * The agentbar instance that this plugin is tied to
       */
      this.agentbar = agentbar;

      this.agentbar.on({
          scope : this,
          render: this.createDropTarget
      });
    },

    /**
     * Creates a drop target on the agentbar
     */
    createDropTarget: function() {
        /**
         * @property dropTarget
         * @type Ext.dd.DropTarget
         * The drop target attached to the agentbar instance
         */
        this.dropTarget = Ext.create('Ext.dd.DropTarget', this.agentbar.getEl(), {
            notifyOver: Ext.Function.bind(this.notifyOver, this),
            notifyDrop: Ext.Function.bind(this.notifyDrop, this)
        });
    },

    /**
     * Adds the given DD Group to the drop target
     * @param {String} ddGroup The DD Group
     */
    addDDGroup: function(ddGroup) {
        this.dropTarget.addToGroup(ddGroup);
    },

    /**
     * Calculates the location on the agentbar to create the new sorter button based on the XY of the
     * drag event
     * @param {Ext.EventObject} e The event object
     * @return {Number} The index at which to insert the new button
     */    
    calculateEntryIndex: function(e) {
        var entryIndex = 0,
            agentbar = this.agentbar,
            items = agentbar.items.items,
            count = items.length,
            xHover = e.getXY()[0],
            index = 0,
            el, xTotal, width, midpoint;
 
        for (; index < count; index++) {
            el = items[index].getEl();
            xTotal = el.getXY()[0];
            width = el.getWidth();
            midpoint = xTotal + width / 2;
 
            if (xHover < midpoint) {
                entryIndex = index; 
                break;
            } else {
                entryIndex = index + 1;
            }
       }
       return entryIndex;
    },

    /**
     * Returns true if the drop is allowed on the drop target. This function can be overridden
     * and defaults to simply return true
     * @param {Object} data Arbitrary data from the drag source
     * @return {Boolean} True if the drop is allowed
     */
    canDrop: function(data) {
        return true;
    },

    /**
     * Custom notifyOver method which will be used in the plugin's internal DropTarget
     * @return {String} The CSS class to add
     */
    notifyOver: function(dragSource, event, data) {
        return this.canDrop.apply(this, arguments) ? this.dropTarget.dropAllowed : this.dropTarget.dropNotAllowed;
    },

    /**
     * Called when the drop has been made. Creates the new agentbar item, places it at the correct location
     * and calls the afterLayout callback.
     */
    notifyDrop: function(dragSource, event, data) {
        var canAdd = this.canDrop(dragSource, event, data),
            tbar   = this.agentbar;

        if (canAdd) {
            var entryIndex = this.calculateEntryIndex(event);

            tbar.insert(entryIndex, this.createItem(data));
            tbar.doLayout();

            this.afterLayout();
        }

        return canAdd;
    },

    /**
     * Creates the new agentbar item based on drop data. This method must be implemented by the plugin instance
     * @param {Object} data Arbitrary data from the drop
     * @return {Mixed} An item that can be added to a agentbar
     */
    createItem: function(data) {
        //<debug>
        Ext.Error.raise("The createItem method must be implemented in the AgentbarDroppable plugin");
        //</debug>
    },

    /**
     * Called after a new button has been created and added to the agentbar. Add any required cleanup logic here
     */
    afterLayout: Ext.emptyFn
});
