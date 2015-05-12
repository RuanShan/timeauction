var app = angular.module('timeauction');

app.controller('HoursEntryCtrl', ['$scope', "Nonprofits", function($scope, Nonprofits) {
  Nonprofits.syncFields()
  syncHoursFields()

  $("body").on("click", ".add-more-hours li", function() {
    var lastHoursRow = $(".hours-month-year-entry").last()
    $(".hours-month-year-holder").append(lastHoursRow.clone())
  })

  $scope.showNewFields = !($(".new-hours-entry-fields").attr("data-has-entries") == "true")
  $scope.canSelectAll = true
  $scope.lastMonth = new Date($(".month-selection").last().attr("data-js-date-format"))

  updateWithDropdown()

  $(".existing-dropdown").change(function() {
    updateWithDropdown()
  });

  function updateWithDropdown() {
    var ele = $(".existing-dropdown option:selected")
    var name = ele.attr("data-contact-name")
    var position = ele.attr("data-contact-position")
    var phone = ele.attr("data-contact-phone")
    var email = ele.attr("data-contact-email")

    $(".contact-position").text(position)
    $(".contact-phone").text(phone)
    $(".contact-email").text(email)

    $("#hours_entry_contact_name").val(name)
    $("#hours_entry_contact_position").val(position)
    $("#hours_entry_contact_phone").val(phone)
    $("#hours_entry_contact_email").val(email)
  }

  $scope.fillFields = function() {
    $scope.showNewFields = false
    updateWithDropdown()
  }

  $scope.clearFields = function() {
    $scope.showNewFields = true
    $("#hours_entry_contact_name").val("")
    $("#hours_entry_contact_position").val("")
    $("#hours_entry_contact_phone").val("")
    $("#hours_entry_contact_email").val("")
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
        hours + "-" + $(hoursEntries[i]).find("#date_month").val() + "-" + $(hoursEntries[i]).find("#date_year").val()
      )
      $(".hidden-hours-entry-hours-field").val(hours)
    };
    $(".hidden-hours-entry-dates-field").val(dates.join(", "))
  }
}]);















