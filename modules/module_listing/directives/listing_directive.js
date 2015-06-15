(function () {
	'use strict';

	angular.module('Listing')
		.directive('typeAhead', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
			return {
				replace: true,
				restrict: 'EA',
				require: 'ngModel',
				templateUrl: 'modules/module_listing/partials/search_listing.html',

				link: function (scope, element, attrs, ngModel) {
					ngModel.$setValidity('listing_term', false);
					ngModel.$setViewValue(null);
					scope.selectListing = false;

					/** Initialize bloodhound properties for a remote call */
					var listingList = new Bloodhound({
						datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
						queryTokenizer: Bloodhound.tokenizers.whitespace,
						//prefetch: '/update-form/ex-data/flh-data.json',
						remote: {
							url: gov.hc.flh.env.resources.endpoints.organizations + '?search=%QUERY',
							dataType: 'json',
							filter: function(resp) {
								return resp.results;
							}
						},
						valuekey: 'name',
						cache: false
					});

					// Only for clearing out the cache for prefetched data
					listingList.clearPrefetchCache();
					listingList.initialize();

					var listingInput = angular.element(element[0]).find('.typeahead'),
						options = {
							hint: true,
							highlight: true,
							minLength: 1
						},
						datasets = {
							name: 'listingList',
							displayKey: 'name',
							source: listingList.ttAdapter()
						};

					listingInput.typeahead(options, datasets);

					listingInput.on('typeahead:selected typeahead:autocompleted', function (event, data) {
                        event.stopPropagation();

                        $timeout(function () {
                            if(data) {
                                // set the parsed value back on the view model
                                ngModel.$setViewValue(data);
                                ngModel.$setValidity('listing_term', true);
                                scope.selectListing = false;
                            }
                        }, 0);
                    });

                    listingInput.on('blur', function (event) {
                        var inputVal = listingInput.val(),
                            modelObj = ngModel.$viewValue,
                            modelVal = null;

                        if (modelObj && modelObj.hasOwnProperty('name')) {
                            // get the stored value name
                            modelVal = modelObj.name;
                        }

                        // check if the stored value name matches the current 
                        // input value, or if there is no stored value
                        if (!modelVal || modelVal !== inputVal) {
                            $timeout(function () {
                                scope.selectListing = true;
                                ngModel.$setViewValue(null);
                                ngModel.$setValidity('listing_term', false);
                            }, 0);
                        } else {
                        	//scope.listing_term = modelVal;
                        }
                    });
				}
			}
		}]);
})();