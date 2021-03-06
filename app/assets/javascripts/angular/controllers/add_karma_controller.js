var app = angular.module('timeauction');

app.controller('AddKarmaCtrl', ['$scope', 'Donations', 'VolunteerHours', 'Bids', 'Karmas', function($scope, Donations, VolunteerHours, Bids, Karmas) {
  syncHoursFields()

  $(".karma-count").stick_in_parent({parent: "body", bottoming: false})

  $scope.showDonateSection = false
  $scope.showVolunteerSection = false
  $(".new-hours-entry-holder").show() // So that users don't see the page in transition to hide certain sections
  $scope.canSelectAll = true
  $scope.lastMonth = new Date($(".month-selection").last().attr("data-js-date-format"))
  $scope.totalKarmaToAdd = 0
  $scope.canClickAdd = false
  $scope.donationAmount = 10
  $scope.oldCustomDonationAmount = parseFloat($(".custom-input").attr("data-amount"))
  $scope.donationsExchangeRate = parseInt($(".add-donations-form").attr("data-donations-exchange-rate"))
  $scope.hoursExchangeRate = parseInt($(".add-hours-form").attr("data-hours-exchange-rate"))
  $scope.useExistingCard = $(".add-donations-form").attr("data-has-card") == "true"
  $scope.bidPage = $(".apply-step-holder").attr("data-bid-page") == "true"
  $scope.bids = Bids
  $scope.bids.karmaScope = $scope

  var hk = $(".bid-page-holder").data("hk") || $(".add-hours-form").data("hk");

  // Close Checkout on page navigation
  $(window).on('popstate', function() {
    handler.close();
  });

  $scope.clickDonationToggle = function() {
    $scope.showDonateSection = !$scope.showDonateSection
    if ($scope.showDonateSection) {
      captureCharityDonationInfo()
    }
    setTimeout(delayedUpdateTotalKarma, 100);
  }

  $scope.clickVolunteerToggle = function() {
    $scope.showVolunteerSection = !$scope.showVolunteerSection
    if (hk) {
      if ($scope.showVolunteerSection) {
        $(".add_nested_fields")[0].click()
      } else {
        $(".remove_nested_fields")[0].click()
      }
    }
    setTimeout(delayedUpdateTotalKarma, 100);
  }

  function delayedUpdateTotalKarma() {
    var hoursEntries = $(".hours-month-year-entry:visible")
    $scope.updateTotalKarma(hoursEntries)
    if (!$scope.showDonateSection && !$scope.showVolunteerSection) {
      $scope.canClickAdd = false
    } else if ($scope.showDonateSection) {
      $scope.canClickAdd = true
    }
  }

  $("body").on("click", ".add-more-hours li", function() {
    var lastHoursRowHolder = $(this).parents(".add-more-hours").siblings(".hours-month-year-holder")
    var lastHoursRow = lastHoursRowHolder.find(".hours-month-year-entry").last()
    var nextVal = lastHoursRow.find("#date_month option:selected").next().val()
    if (typeof nextVal === "undefined") {
      nextVal = lastHoursRow.find("#date_month option:selected").val()
    }

    lastHoursRowHolder.append(lastHoursRow.clone())

    lastHoursRow.next().find(".hours").val("") // New last row
    lastHoursRow.next().find("#date_month").val(nextVal)

    toggleLastX($(this), "add")
  })

  $("body").on("click", ".close-icon", function() {
    var parent = $(this).parents(".hours-month-year-holder")
    $(this).parents(".hours-month-year-entry").remove()
    toggleLastX(parent, "remove")
    var hoursEntries = $(".hours-month-year-entry:visible")
    $scope.updateTotalKarma(hoursEntries)
  })

  $("body").on("click", ".add-karma-main-button", function(e) {
    e.preventDefault();
    if ($scope.canClickAdd) {
      var errors = []
      errors = VolunteerHours.fieldsValidation(errors)
      errors = VolunteerHours.hoursValidation(errors)

      if (errors.length > 0) {
        VolunteerHours.displayErrors(errors)
      } else {
        if ($scope.showDonateSection) {
          if ($scope.useExistingCard) {
            Donations.makeDonationCall(null, $scope)
          } else {
            Donations.openHandler($scope)
            e.preventDefault();
          }
        } else {
          Donations.showLoader($scope)
          $(".edit_user").submit();
        }
      }
    }
  })

  function captureCharityDonationInfo() {
    $scope.charityName = $(".nonprofit-select").find("option:selected").text()
    $scope.charityId = $(".nonprofit-select").find("option:selected").val()
  }

  $("body").on("change", ".nonprofit-select", function() {
    captureCharityDonationInfo()
  })

  $("body").on("change", ".existing-dropdown", function() {
    var ele = $(this).find("option:selected")
    updateWithDropdown(ele)
  })

  $("body").on("click", ".toggle-existing", function() {
    $(this).siblings(".toggle-new").removeClass("active")
    $(this).addClass("active")
    $(this).parents(".verifier-nav").siblings(".new-hours-entry-fields").hide()
    var entryHolder = $(this).parents(".verifier-nav").siblings(".existing-hours-entry-holder")
    entryHolder.show()

    var ele = entryHolder.find(".existing-dropdown option:selected")
    updateWithDropdown(ele)
  })

  $("body").on("click", ".toggle-new", function() {
    addNewVerifier($(this))
  })

  function updateWithDropdown(ele) {
    var name = ele.attr("data-contact-name")
    var position = ele.attr("data-contact-position")
    var phone = ele.attr("data-contact-phone")
    var email = ele.attr("data-contact-email")

    ele.parents(".existing-dropdown").siblings(".verifier-details").find(".contact-position").text(position)
    var phoneDiv = ele.parents(".existing-dropdown").siblings(".verifier-details").find(".contact-phone")
    if (phoneDiv) {
      phoneDiv.text(phone)
    }
    ele.parents(".existing-dropdown").siblings(".verifier-details").find(".contact-email").text(email)

    ele.parents(".existing-hours-entry-holder").siblings(".new-hours-entry-fields").find(".user_hours_entries_contact_name").find("input").val(name)
    ele.parents(".existing-hours-entry-holder").siblings(".new-hours-entry-fields").find(".user_hours_entries_contact_position").find("input").val(position)
    ele.parents(".existing-hours-entry-holder").siblings(".new-hours-entry-fields").find(".user_hours_entries_contact_phone").find("input").val(phone)
    ele.parents(".existing-hours-entry-holder").siblings(".new-hours-entry-fields").find(".user_hours_entries_contact_email").find("input").val(email)
  }

  function addNewVerifier(ele) {
    var hoursEntryFields = ele.parents(".verifier-holder").find(".new-hours-entry-fields")
    hoursEntryFields.find(".user_hours_entries_contact_name").find("input").val("")
    hoursEntryFields.find(".user_hours_entries_contact_position").find("input").val("")
    hoursEntryFields.find(".user_hours_entries_contact_phone").find("input").val("")
    hoursEntryFields.find(".user_hours_entries_contact_email").find("input").val("")
    hoursEntryFields.siblings(".verifier-nav").find(".toggle-existing").removeClass("active")
    hoursEntryFields.siblings(".verifier-nav").find(".toggle-new").addClass("active")
    hoursEntryFields.siblings(".existing-hours-entry-holder").hide()
    hoursEntryFields.show()
  }

  function syncHoursFields() {
    setInterval(function() { updateHiddenDates(); }, 500);
  }

  function updateHiddenDates() {
    var dates = []
    var hoursEntries = $(".hours-month-year-entry")
    for (var i = 0; i < hoursEntries.length; i++) {
      var hours = $(hoursEntries[i]).find(".hours").val()
      dates.push(
        hours + "-" + $(hoursEntries[i]).find("#date_month").val()
      )
      $(hoursEntries[i]).siblings(".user_hours_entries_dates").find(".hidden-hours-entry-dates-field").val(dates.join(", "))

      // Clear dates array if going to another hours entry
      if ($(hoursEntries[i]).is(':last-child')) {
        dates = []
      }
    };
  }

  function toggleLastX(ele, type) {
    if (type == "add") {
      var hoursEntries = ele.parents(".add-more-hours").siblings(".hours-month-year-holder").find(".hours-month-year-entry")
    } else {
      var hoursEntries = ele.find(".hours-month-year-entry")
    }

    // If the close icon has already been removed
    if (hoursEntries.length == 1) {
      for (var i = 0; i < hoursEntries.length; i++) {
        $(hoursEntries[i]).find(".close-icon").hide()
      };
    } else {
      for (var i = 0; i < hoursEntries.length; i++) {
        $(hoursEntries[i]).find(".close-icon").show()
      };
    }
  }

  $("body").on('nested:fieldAdded', function(event){
    var ele = $(event.target).find(".existing-dropdown option:selected")
    updateWithDropdown(ele)
    $scope.canClickAdd = true

    $(".nonprofit-name-autocomplete").on('autocompleteresponse', function(event, ui) {
      var content;
      if (((content = ui.content) != null ? content[0].id.length : void 0) === 0) {
        $(this).autocomplete('close');
      }
    });
    setTimeout(delayedUpdateTotalKarma, 100);
  })

  $("body").on('nested:fieldRemoved', function(event){
    $(event.target).remove()
    if ($(".individual-hours-entry-fields:visible").length == 0) {
      $scope.canClickAdd = false
    }
    setTimeout(delayedUpdateTotalKarma, 100);
  });

  $("body").on("keyup change paste", ".hours", function() {
    $(".js-added-error").remove()
    var errors = []
    errors = VolunteerHours.hoursValidation(errors)

    if (errors.length > 0) {
      VolunteerHours.displayErrors(errors)
    } else {
      var hoursEntries = $(".hours-month-year-entry:visible")
      $scope.updateTotalKarma(hoursEntries)
    }
  })

  $scope.updateTotalKarma = function(hoursEntries) {
    sum = donationKarmaAmount()
    hoursSum = 0
    for (var i = 0; i < hoursEntries.length; i++) {
      var entry = $(hoursEntries[i]).find(".hours").val()
      if (entry != "") {
        hoursSum += parseInt($(hoursEntries[i]).find(".hours").val()) * $scope.hoursExchangeRate
      }
    };
    $scope.pointsFromHoursOnly = hoursSum
    $scope.totalKarmaToAdd = sum + hoursSum
    $(".total-karma-to-add").text(Karmas.commaSeparateNumber(sum + hoursSum))
  }

  $("body").on("click", ".amount-list li", function() {
    if (!$(this).hasClass("custom-input-text")) {
      updateSliders($(this))
    } else {
      updateSliders($(".custom-input"))
    }

    $(".amount-list li").removeClass("selected")

    if (!$(this).hasClass("custom-input-text")) {
      $(this).addClass("selected")
      $(".custom-input-box").val("$" + $(".custom-input").attr("data-amount"))
      $(".custom-input-error").html("")
      errorsCheck($(".custom-input-box")) // To set the add button as clickable or not
    } else {
      $(".custom-input").addClass("selected")
    }

    var hoursEntries = $(".hours-month-year-entry:visible")
    $scope.updateTotalKarma(hoursEntries)
  })

  function updateSliders(ele) {
    $scope.donationAmount = parseFloat(ele.attr("data-amount"))
    if (ele.hasClass("custom-input") && $(".amount-list li.selected").hasClass("custom-input")) {
      var oldTotalAmount = $scope.oldCustomDonationAmount
    } else {
      var oldTotalAmount = parseFloat($(".amount-list li.selected").attr("data-amount"))
    }
    var oldCharityAmount = parseFloat($(".charity-range-slider").val())
    var oldCharityRate = oldCharityAmount / oldTotalAmount
    var newCharityAmount = $scope.donationAmount * oldCharityRate

    $(".charity-range-slider").noUiSlider({
      start: newCharityAmount,
      connect: "lower",
      range: {
        'min': 0,
        'max': $scope.donationAmount
      }
    }, true);

    $(".ta-tip-range-slider").noUiSlider({
      start: $scope.donationAmount - newCharityAmount,
      connect: "lower",
      range: {
        'min': 0,
        'max': $scope.donationAmount
      }
    }, true);
  }

  $scope.clickCustomAmount = function() {
    $scope.showCustomAmount = true
    setTimeout(selectCustom, 100);
  }

  $("body").on("keyup", ".custom-input-box", function() {
    var errors = errorsCheck($(this))
    if (errors) {
      displayCustomError(errors)
    } else {
      $(".custom-input-error").html("")
      var currentVal = Math.round((cleanFromRegex(getCurrentVal($(this))) + 0.00001) * 100) / 100
      $(".custom-input").attr("data-amount", currentVal)
      $scope.donationAmount = currentVal
      updateSliders($(".custom-input"))
      $scope.oldCustomDonationAmount = currentVal
      var hoursEntries = $(".hours-month-year-entry:visible")
      $scope.updateTotalKarma(hoursEntries)
    }
  })

  function displayCustomError(errors) {
    $(".custom-input-error").html("")
    $(".custom-input-error").append("<div>" + errors.message + "</div>")
    $(".total-karma-to-add").text("-")
  }

  function errorsCheck(ele) {
    var currentVal = getCurrentVal(ele)
    return customDonationValidation(currentVal)
  }

  function getCurrentVal(ele) {
    var regexp = /^\$?[0-9]+(\.[0-9]+)?$/g;
    return regexp.exec(ele.val());
  }

  function customDonationValidation(value) {
    $scope.canClickAdd = false
    if (value === null || isNaN(cleanFromRegex(value))) {
      return {
        message: "Enter a number"
      }
    } else if (!isInt(cleanFromRegex(value))) {
      return {
        message: "No decimals"
      }
    } else if (cleanFromRegex(value) <= 0) {
      return {
        message: "Be positive"
      }
    } else if (cleanFromRegex(value) >= 100000) {
      return {
        message: "You're being too nice"
      }
    } else {
      $scope.canClickAdd = true
      return false
    }
  }

  function isInt(value) {
    return value % 1 === 0;
  }

  function cleanFromRegex(value) {
    return parseFloat(value[0].replace('$', ''))
  }

  function selectCustom() {
    $(".custom-input input").focus()
    $(".custom-input input").select()
  }

  $(".charity-range-slider").noUiSlider({
    start: 9,
    connect: "lower",
    range: {
      'min': 0,
      'max': $scope.donationAmount
    }
  });

  $(".charity-range-slider").Link('lower').to($(".charity-amount"), null, wNumb({
    prefix: '$',
    decimals: 2,
    thousand: ','
  }));

  $(".ta-tip-range-slider").noUiSlider({
    start: 1,
    connect: "lower",
    range: {
      'min': 0,
      'max': $scope.donationAmount
    }
  });

  $(".ta-tip-range-slider").Link('lower').to($(".ta-tip-amount"), null, wNumb({
    prefix: '$',
    decimals: 2,
    thousand: ','
  }));

  $(".charity-range-slider").on({
    slide: function() {
      $(".ta-tip-range-slider").val($scope.donationAmount - $(this).val());
    },

    // Just for rspec testing purposes

    set: function() {
      var tipAmount = $scope.donationAmount - $(this).val()
      if (!($(".ta-tip-range-slider").val() == tipAmount)) {
        $(".ta-tip-range-slider").val(tipAmount);
      }
    }
  });

  $(".ta-tip-range-slider").on({
    slide: function() {
      $(".charity-range-slider").val($scope.donationAmount - $(this).val());
    }
  });

  function donationKarmaAmount() {
    if ($scope.showDonateSection) {
      return Math.round($scope.donationAmount) * $scope.donationsExchangeRate
    } else {
      return 0
    }
  }
}]);















