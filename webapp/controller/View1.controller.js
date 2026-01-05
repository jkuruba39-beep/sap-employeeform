sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",	
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function (Controller, MessageBox, MessageToast,Filter,FilterOperator) {
    "use strict";

    return Controller.extend("antric.info.employeeform.controller.View1", {

        onInit: function () {},

        /* ===============================
           Selection
        =============================== */
        onSelectionChange: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("listItem");
            if (!oSelectedItem) {
                return;
            }

            var oContext = oSelectedItem.getBindingContext();
            this._selectedPath = oContext.getPath(); // /Products(1)
        },

        /* ===============================
           DELETE
        =============================== */
        onDeleteProduct: function () {
            if (!this._selectedPath) {
                MessageToast.show("Please select a row");
                return;
            }

            MessageBox.confirm("Do you want to delete this product?", {
                title: "Confirm",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this._productDelete();
                    }
                }.bind(this)
            });
        },

        _productDelete: function () {
            var oModel = this.getView().getModel();

            oModel.remove(this._selectedPath, {
                success: function () {
                    MessageToast.show("Product deleted successfully");
                },
                error: function () {
                    MessageToast.show("Delete failed");
                }
            });

            this._selectedPath = null;
        },

        /* ===============================
           CREATE
        =============================== */
        onCreateProduct: function () {
            var oView = this.getView();

            if (!this._oCreateDialog) {
                this._oCreateDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "antric.info.employeeform.fragments.CreateProduct",
                    this
                );
                oView.addDependent(this._oCreateDialog);
            }

            this._oCreateDialog.open();
        },

        onCreateConfirm: function () {
            var oModel = this.getView().getModel();

            var oNewProduct = {
                ID: this.byId("prodIdInput").getValue(),          // string
                Name: this.byId("nameInput").getValue(),
                Description: this.byId("descInput").getValue(),
                ReleaseDate: this.byId("releaseDateInput").getDateValue(),
                DiscontinuedDate: this.byId("discontinuedDateInput").getDateValue(),
                Price: this.byId("priceInput").getValue(),       // Decimal → STRING
                Rating: parseInt(this.byId("ratingInput").getValue(), 10)
            };

            oModel.create("/Products", oNewProduct, {
                success: function () {
                    MessageToast.show("Product created successfully");
                    oModel.refresh(true);
                    this._oCreateDialog.close();
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Create failed");
                    console.error(oError);
                }
            });
        },

        onCreateCancel: function () {
            this._oCreateDialog.close();
        },

        /* ===============================
           UPDATE
        =============================== */
        onOpenUpdateDialog: function () {
            if (!this._selectedPath) {
                MessageToast.show("Please select a row");
                return;
            }

            var oView = this.getView();
            var oModel = oView.getModel();

            if (!this._oUpdateDialog) {
                this._oUpdateDialog = sap.ui.xmlfragment(
                    oView.getId(),
                    "antric.info.employeeform.fragments.UpdateProduct",
                    this
                );
                oView.addDependent(this._oUpdateDialog);
            }

            // Read selected data and prefill dialog
            var oData = oModel.getProperty(this._selectedPath);

            this.byId("updProdIdInput").setValue(oData.ID);
            this.byId("updNameInput").setValue(oData.Name);
            this.byId("updDescInput").setValue(oData.Description);
            this.byId("updReleaseDateInput").setDateValue(oData.ReleaseDate);
            this.byId("updDiscontinuedDateInput").setDateValue(oData.DiscontinuedDate);
            this.byId("updPriceInput").setValue(oData.Price);
            this.byId("updRatingInput").setValue(oData.Rating);

            this._oUpdateDialog.open();
        },

        onUpdateConfirm: function () {
            var oModel = this.getView().getModel();

            var oUpdatedData = {
                Name: this.byId("updNameInput").getValue(),
                Description: this.byId("updDescInput").getValue(),
                ReleaseDate: this.byId("updReleaseDateInput").getDateValue(),
                DiscontinuedDate: this.byId("updDiscontinuedDateInput").getDateValue(),
                Price: this.byId("updPriceInput").getValue(), // Decimal as string
                Rating: parseInt(this.byId("updRatingInput").getValue(), 10)
            };

            oModel.update(this._selectedPath, oUpdatedData, {
                success: function () {
                    MessageToast.show("Product updated successfully");
                    this._oUpdateDialog.close();
                    oModel.refresh(true);
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Update failed");
                    console.error(oError);
                }
            });
        },

        onUpdateCancel: function () {
            this._oUpdateDialog.close();
        },





       onSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("ID", FilterOperator.Contains, sQuery),
                        new Filter("ProductName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oTable = this.byId("idList");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        }



    });
});
