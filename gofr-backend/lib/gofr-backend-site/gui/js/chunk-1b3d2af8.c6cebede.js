(window["webpackJsonp"] = window["webpackJsonp"] || []).push([
	["chunk-1b3d2af8"],
	{
		b78c: function(module, __webpack_exports__, __webpack_require__) {
			"use strict";

			__webpack_require__.r(__webpack_exports__);

			var DAMM_TABLE = [
				[0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
				[7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
				[4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
				[1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
				[6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
				[3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
				[5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
				[8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
				[9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
				[2, 5, 8, 1, 4, 3, 6, 7, 9, 0]
			];

			function computeCheckDigit(body) {
				var interim = 0;
				var index;

				for (index = 0; index < body.length; index += 1) {
					interim = DAMM_TABLE[interim][parseInt(body.charAt(index), 10)];
				}

				return interim;
			}

			function verifyHfidValue(numericString) {
				var interim = 0;
				var index;

				if (!/^\d{6}$/.test(numericString)) {
					return false;
				}

				for (index = 0; index < numericString.length; index += 1) {
					interim = DAMM_TABLE[interim][parseInt(numericString.charAt(index), 10)];
				}

				return interim === 0;
			}

			function generateHfidValue() {
				var body = "";
				var index;

				for (index = 0; index < 5; index += 1) {
					body += String(Math.floor(Math.random() * 10));
				}

				return body + String(computeCheckDigit(body));
			}

			function formatHfidDisplayValue(numericString) {
				if (!/^\d{6}$/.test(numericString)) {
					return numericString;
				}

				return "F-" + numericString.slice(0, 3) + "-" + numericString.slice(3);
			}

			function parseHfidInputValue(rawInput) {
				var cleaned;

				if (rawInput === undefined || rawInput === null || rawInput === "") {
					return null;
				}

				cleaned = String(rawInput).trim();
				if (cleaned.toUpperCase().indexOf("F") === 0) {
					cleaned = cleaned.slice(1);
				}

				cleaned = cleaned.replace(/[-\s]/g, "");
				if (!/^\d{6}$/.test(cleaned)) {
					return null;
				}

				return cleaned;
			}

			var render = function() {
				var vm = this;
				var h = vm.$createElement;

				return h("gofr-element", {
					attrs: {
						edit: vm.edit,
						loading: false
					},
					scopedSlots: {
						form: function() {
							return [
								h("v-text-field", {
									attrs: {
										"error-messages": vm.errors,
										disabled: vm.disabled,
										label: vm.$t("App.fhir-resources-texts." + vm.display),
										outlined: "",
										"hide-details": "auto",
										rules: vm.rules,
										type: vm.isPassword ? (vm.showPassword ? "text" : "password") : "text",
										"append-icon": vm.isHfid
											? "mdi-refresh"
											: (vm.isPassword ? (vm.showPassword ? "mdi-eye" : "mdi-eye-off") : ""),
										hint: vm.isHfid && vm.hfidDisplayFormat ? "Display: " + vm.hfidDisplayFormat : "",
										"persistent-hint": vm.isHfid && !!vm.hfidDisplayFormat,
										dense: ""
									},
									on: {
										change: function() {
											vm.errors = [];
										},
										"click:append": function() {
											if (vm.isHfid) {
												vm.generateHfid();
												return;
											}

											vm.showPassword = !vm.showPassword;
										}
									},
									scopedSlots: {
										label: function() {
											var nodes = [vm._v(vm._s(vm.$t("App.fhir-resources-texts." + vm.display)))];

											if (vm.required) {
												nodes.push(
													h("span", { staticClass: "red--text font-weight-bold" }, [vm._v("*")])
												);
											}

											return nodes;
										}
									},
									model: {
										value: vm.value,
										callback: function($$v) {
											vm.value = $$v;
										},
										expression: "value"
									}
								})
							];
						},
						header: function() {
							return [vm._v(" " + vm._s(vm.$t("App.fhir-resources-texts." + vm.display)) + " ")];
						},
						value: function() {
							return [
								vm._v(" " + vm._s(vm.isHfid && vm.value ? vm.hfidDisplayFormat : vm.value) + " ")
							];
						}
					}
				});
			};

			var staticRenderFns = [];

			var GofrElement = __webpack_require__("d79a");
			var componentOptions = {
				name: "fhir-string",
				props: [
					"field",
					"label",
					"min",
					"max",
					"id",
					"path",
					"slotProps",
					"sliceName",
					"base-min",
					"base-max",
					"edit",
					"readOnlyIfSet",
					"constraints",
					"displayType"
				],
				components: {
					GofrElement: GofrElement["a"]
				},
				data: function() {
					return {
						source: { path: "", data: {} },
						value: "",
						showPassword: false,
						qField: "valueString",
						disabled: false,
						errors: [],
						lockWatch: false
					};
				},
				created: function() {
					this.setupData();
				},
				watch: {
					slotProps: {
						handler: function() {
							if (!this.lockWatch) {
								this.setupData();
							} else {
								this.ensureHfidValue();
							}
						},
						deep: true
					}
				},
				methods: {
					setupData: function() {
						if (this.slotProps && this.slotProps.source) {
							this.source = {
								path: this.slotProps.source.path + "." + this.field,
								data: {}
							};

							if (this.slotProps.source.fromArray) {
								this.source.data = this.slotProps.source.data;
								this.value = this.source.data;
								this.lockWatch = true;
							} else {
								var expression = this.$fhirutils.pathFieldExpression(this.field);

								this.source.data = this.$fhirpath.evaluate(this.slotProps.source.data, expression);
								if (this.source.data.length === 1) {
									this.value = this.source.data[0];
									this.lockWatch = true;
								}
							}

							this.disabled = this.readOnlyIfSet && !!this.value;
						}

						this.ensureHfidValue();
					},
					generateHfid: function() {
						this.value = generateHfidValue();
					},
					ensureHfidValue: function() {
						if (!this.isHfid || this.value) {
							return;
						}

						this.value = generateHfidValue();
					}
				},
				computed: {
					index: function() {
						return this.slotProps && this.slotProps.input ? this.slotProps.input.index : undefined;
					},
					display: function() {
						return this.slotProps && this.slotProps.input ? this.slotProps.input.label : this.label;
					},
					required: function() {
						return (this.index || 0) < this.min;
					},
					isHfid: function() {
						return (this.display || "").toUpperCase().indexOf("HFID") !== -1;
					},
					hfidDisplayFormat: function() {
						var parsed;

						if (!this.isHfid || !this.value) {
							return "";
						}

						parsed = parseHfidInputValue(this.value);
						return parsed ? formatHfidDisplayValue(parsed) : "";
					},
					rules: function() {
						var vm = this;
						var rules = [];

						if (this.required) {
							rules.push(function(value) {
								return !!value || vm.display + " is required";
							});
						}

						if (this.isHfid) {
							rules.push(function(value) {
								var parsed;

								if (!value) {
									return true;
								}

								parsed = parseHfidInputValue(value);
								if (!parsed) {
									return "HFID must be a 6-digit number (optionally formatted as F-XXX-XXX)";
								}

								return verifyHfidValue(parsed) || "Invalid HFID - check digit does not match (Damm algorithm)";
							});
						}

						return rules;
					},
					isPassword: function() {
						return this.displayType === "password";
					}
				}
			};

			var componentNormalizer = __webpack_require__("2877");
			var installComponents = __webpack_require__("6544");
			var installComponentsDefault = __webpack_require__.n(installComponents);
			var VTextField = __webpack_require__("8654");
			var component = Object(componentNormalizer["a"])(
				componentOptions,
				render,
				staticRenderFns,
				false,
				null,
				null,
				null
			);

			__webpack_exports__["default"] = component.exports;
			installComponentsDefault()(component, { VTextField: VTextField["a"] });
		},

		d79a: function(module, __webpack_exports__, __webpack_require__) {
			"use strict";

			var render = function() {
				var vm = this;
				var h = vm.$createElement;

				return h(
					"div",
					[
						vm.edit
							? h("v-container", [vm._t("form")], 2)
							: h("div", [
									h(
										"v-row",
										{ attrs: { dense: "" } },
										[
											h(
												"v-col",
												{
													staticClass: "font-weight-bold",
													attrs: { cols: vm.$store.state.cols.header }
												},
												[vm._t("header")],
												2
											),
											vm.loading
												? h(
														"v-col",
														{ attrs: { cols: vm.$store.state.cols.content } },
														[
															h("v-progress-linear", {
																attrs: {
																	indeterminate: "",
																	color: "primary"
																}
															})
														],
														1
													)
												: h(
														"v-col",
														{ attrs: { cols: vm.$store.state.cols.content } },
														[vm._t("value")],
														2
													)
										],
										1
									),
									h("v-divider")
								], 1)
					],
					1
				);
			};

			var staticRenderFns = [];
			var componentOptions = {
				name: "gofr-element",
				props: ["edit", "loading"]
			};
			var componentNormalizer = __webpack_require__("2877");
			var installComponents = __webpack_require__("6544");
			var installComponentsDefault = __webpack_require__.n(installComponents);
			var VCol = __webpack_require__("62ad");
			var VContainer = __webpack_require__("a523");
			var VDivider = __webpack_require__("ce7e");
			var VProgressLinear = __webpack_require__("8e36");
			var VRow = __webpack_require__("0fd9");
			var component = Object(componentNormalizer["a"])(
				componentOptions,
				render,
				staticRenderFns,
				false,
				null,
				null,
				null
			);

			__webpack_exports__["a"] = component.exports;
			installComponentsDefault()(component, {
				VCol: VCol["a"],
				VContainer: VContainer["a"],
				VDivider: VDivider["a"],
				VProgressLinear: VProgressLinear["a"],
				VRow: VRow["a"]
			});
		}
	}
]);