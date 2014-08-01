/*
 * Q-municate chat application
 *
 * Routes Module
 *
 */

module.exports = Routes;

var UserView, ContactListView, DialogView, MessageView;

function Routes(app) {
  this.app = app;
  
  UserView = this.app.views.User,
  ContactListView = this.app.views.ContactList,
  DialogView = this.app.views.Dialog,
  MessageView = this.app.views.Message;
}

Routes.prototype = {

  init: function() {

    $(document).on('click', function(event) {
      clickBehaviour(event);
    });

    $('input:file').on('change', function() {
      changeInputFile($(this));
    });

    /* scrollbars
    ----------------------------------------------------- */
    occupantScrollbar();

    /* welcome page
    ----------------------------------------------------- */
    $('#signupFB, #loginFB').on('click', function(event) {
      if (QMCONFIG.debug) console.log('connect with FB');
      event.preventDefault();

      // NOTE!! You should use FB.login method instead FB.getLoginStatus
      // and your browser won't block FB Login popup
      FB.login(function(response) {
        if (QMCONFIG.debug) console.log('FB authResponse', response);
        if (response.status === 'connected') {
          UserView.connectFB(response.authResponse.accessToken);
        }
      }, {scope: QMCONFIG.fbAccount.scope});
    });

    $('#signupQB').on('click', function() {
      if (QMCONFIG.debug) console.log('signup with QB');
      UserView.signupQB();
    });

    $('#loginQB').on('click', function(event) {
      if (QMCONFIG.debug) console.log('login wih QB');
      event.preventDefault();
      UserView.loginQB();
    });

    /* signup page
    ----------------------------------------------------- */
    $('#signupForm').on('click', function(event) {
      if (QMCONFIG.debug) console.log('create user');
      event.preventDefault();
      UserView.signupForm();
    });

    /* login page
    ----------------------------------------------------- */
    $('#forgot').on('click', function(event) {
      if (QMCONFIG.debug) console.log('forgot password');
      event.preventDefault();
      UserView.forgot();
    });

    $('#loginForm').on('click', function(event) {
      if (QMCONFIG.debug) console.log('authorize user');
      event.preventDefault();
      UserView.loginForm();
    });

    /* forgot and reset page
    ----------------------------------------------------- */
    $('#forgotForm').on('click', function(event) {
      if (QMCONFIG.debug) console.log('send letter');
      event.preventDefault();
      UserView.forgotForm();
    });

    $('#resetForm').on('click', function(event) {
      if (QMCONFIG.debug) console.log('reset password');
      event.preventDefault();
      UserView.resetForm();
    });

    /* popovers
    ----------------------------------------------------- */
    $('#profile').on('click', function(event) {
      event.preventDefault();
      removePopover();
      UserView.profilePopover($(this));
    });

    $('.list_contextmenu').on('contextmenu', '.contact', function(event) {
      event.preventDefault();
      removePopover();
      UserView.contactPopover($(this));
    });

    $('.l-workspace-wrap').on('click', '.occupant', function(event) {
      event.preventDefault();
      removePopover();
      UserView.occupantPopover($(this), event);
    });

    $('.l-workspace-wrap').on('click', '.btn_message_smile', function() {
      removePopover();
      UserView.smilePopover($(this));
    });

    /* popups
    ----------------------------------------------------- */
    $('.header-links-item').on('click', '#logout', function(event) {
      event.preventDefault();
      openPopup($('#popupLogout'));
    });

    $('.list, .l-workspace-wrap').on('click', '.deleteContact', function(event) {
      event.preventDefault();
      var id = $(this).parents('.presence-listener').data('id');
      openPopup($('#popupDelete'), id);
    });

    $('#logoutConfirm').on('click', function() {
      UserView.logout();
    });

    $('#deleteConfirm').on('click', function() {
      if (QMCONFIG.debug) console.log('delete contact');
      ContactListView.sendDelete($(this));
    });

    $('.popup-control-button').on('click', function(event) {
      event.preventDefault();
      closePopup();
    });

    $('.search').on('click', function() {
      if (QMCONFIG.debug) console.log('global search');
      ContactListView.globalPopup();
    });

    /* search
    ----------------------------------------------------- */
    $('#globalSearch').on('submit', function(event) {
      event.preventDefault();
      ContactListView.globalSearch($(this));
    });

    $('.localSearch').on('keyup search submit', function(event) {
      event.preventDefault();
      var type = event.type,
          code = event.keyCode; // code=27 (Esc key), code=13 (Enter key)

      if ((type === 'keyup' && code !== 27 && code !== 13) || (type === 'search')) {
        UserView.localSearch($(this));
      }
    });

    /* subscriptions
    ----------------------------------------------------- */
    $('.list_contacts').on('click', 'button.send-request', function() {
      if (QMCONFIG.debug) console.log('send subscribe');
      ContactListView.sendSubscribe($(this));
    });

    $('.l-workspace-wrap').on('click', '.btn_request_again', function() {
      if (QMCONFIG.debug) console.log('send subscribe');
      ContactListView.sendSubscribe($(this), true);
    });

    $('.list').on('click', '.request-button_ok', function() {
      if (QMCONFIG.debug) console.log('send confirm');
      ContactListView.sendConfirm($(this));
    });

    $('.list').on('click', '.request-button_cancel', function() {
      if (QMCONFIG.debug) console.log('send reject');
      ContactListView.sendReject($(this));
    });

    /* dialogs
    ----------------------------------------------------- */
    $('.l-list:not(#requestsList)').on('click', '.contact', function(event) {
      event.preventDefault();
      DialogView.htmlBuild($(this));
    });

    $('#requestsList').on('click', '.contact', function(event) {
      event.preventDefault();
    });

    $('.l-workspace-wrap').on('keydown', '.l-message', function(event) {
      var shiftKey = event.shiftKey,
          code = event.keyCode; // code=27 (Esc key), code=13 (Enter key)

      if (code === 13 && !shiftKey) {
        MessageView.sendMessage($(this));
      }
    });

    $('.l-workspace-wrap').on('submit', '.l-message', function(event) {
      event.preventDefault();
    });

    $('#home').on('click', function(event) {
      event.preventDefault();
      $('#capBox').removeClass('is-hidden').siblings().addClass('is-hidden');
      $('.is-selected').removeClass('is-selected');
    });

    $('.l-workspace-wrap').on('click', '.groupTitle', function() {
      var chat = $('.l-chat:visible');
      if (chat.find('.triangle_up').is('.is-hidden')) {
        chat.find('.triangle_up').removeClass('is-hidden').siblings('.triangle').addClass('is-hidden');
        chat.find('.chat-occupants-wrap').addClass('is-overlay');
        chat.find('.l-chat-content').addClass('l-chat-content_min');
      } else {
        chat.find('.triangle_down').removeClass('is-hidden').siblings('.triangle').addClass('is-hidden');
        chat.find('.chat-occupants-wrap').removeClass('is-overlay');
        chat.find('.l-chat-content').removeClass('l-chat-content_min');
      }
    });

    /* temporary routes
    ----------------------------------------------------- */
    $('#share, #contacts').on('click', function(event) {
      event.preventDefault();
    });

  }
};

/* Private
---------------------------------------------------------------------- */
function occupantScrollbar() {
  $('.chat-occupants').mCustomScrollbar({
    theme: 'minimal-dark',
    scrollInertia: 50,
    live: true
  });
}

// Checking if the target is not an object run popover
function clickBehaviour(e) {
  var objDom = $(e.target);

  if (objDom.is('#profile, #profile *, .occupant, .occupant *, .btn_message_smile, .btn_message_smile *') || e.which === 3) {
    return false;
  } else {
    removePopover();

    if (objDom.is('.popups') && !$('.popup.is-overlay').is('.is-open')) {
      closePopup();
    } else {
      return false;
    }
  }
}

function changeInputFile(objDom) {
  var URL = window.webkitURL || window.URL,
      file = objDom[0].files[0],
      src = file ? URL.createObjectURL(file) : QMCONFIG.defAvatar.url,
      fileName = file ? file.name : QMCONFIG.defAvatar.caption;
  
  objDom.prev().find('img').attr('src', src).siblings('span').text(fileName);
  if (typeof file !== 'undefined') URL.revokeObjectURL(src);
}

function removePopover() {
  $('.is-contextmenu').removeClass('is-contextmenu');
  $('.is-active').removeClass('is-active');
  $('.btn_message_smile .is-hidden').removeClass('is-hidden').siblings().remove();
  $('.popover').remove();
}

var openPopup = function(objDom, id) {
  // if it was the delete action
  if (id) {
    objDom.find('#deleteConfirm').data('id', id);
  }
  objDom.add('.popups').addClass('is-overlay');
};

var closePopup = function() {
  $('.is-overlay').removeClass('is-overlay');
};