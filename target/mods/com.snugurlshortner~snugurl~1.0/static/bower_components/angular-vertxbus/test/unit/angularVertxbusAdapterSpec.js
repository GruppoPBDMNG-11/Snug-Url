/* jshint camelcase: false, undef: true, unused: true, browser: true */
/* global console: false, module: false, describe: false, it: false, expect: false, beforeEach: false, inject: false, SockJS: false */

describe('knalli.angular-vertxbus', function () {

  beforeEach(module('knalli.angular-vertxbus'));

  it('should have vertxEventBus', function () {
    inject(function (vertxEventBus) {
      expect(vertxEventBus).not.to.be(undefined);
    });
  });

  it('should have vertxEventBusService', function () {
    inject(function (vertxEventBusService) {
      expect(vertxEventBusService).not.to.be(undefined);
    });
  });


  describe('vertxEventBus', function () {

    var vertxEventBus, $timeout, $rootScope;

    beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
      // Override (improve test running time)
      vertxEventBusProvider.useDebug(true).useSockJsReconnectInterval(2000);
    }));

    beforeEach(inject(function (_vertxEventBus_, _$timeout_, _$rootScope_) {
      vertxEventBus = _vertxEventBus_;
      $timeout = _$timeout_;
      $rootScope = _$rootScope_;
    }));

    it('should be an object', function () {
      expect(typeof vertxEventBus).to.be('object');
    });

    it('should have a method close()', function () {
      expect(vertxEventBus.close).not.to.be(undefined);
    });

    describe('constructor()', function () {
      // Delegating onopen transparently
      it('should call the onopen function', function (done) {
        var ok = false;
        vertxEventBus.onopen = function () {
          ok = true;
        };
        setTimeout(function () {
          setTimeout(function () {
            expect(ok).to.be(true);
            done();
          }, 1000);
        }, 200);
      });
    });

    describe('close()', function () {
      it('should be a function', function () {
        expect(typeof vertxEventBus.close).to.be('function');
      });
      // Delegating onclose transparently
      it('should call the onclose function', function (done) {
        var ok = false;
        vertxEventBus.onclose = function () {
          ok = true;
        };
        setTimeout(function () {
          vertxEventBus.close();
          setTimeout(function () {
            expect(ok).to.be(true);
            done();
          }, 1000);
        }, 200);
      });
    });

    describe('reconnect()', function () {
      it('should be a function', function () {
        expect(typeof vertxEventBus.reconnect).to.be('function');
      });
      // Reconnect should be switch the connectivity, onopen() and onclose()
      // must be delegated transparently
      it('should call onclose and onopen functions', function (done) {
        this.timeout(20000);
        var okClose = false, okOpen = false;
        setTimeout(function () {
          vertxEventBus.onclose = function () {
            console.debug('[TEST] onclose() called');
            okClose = true;
          };
          vertxEventBus.onopen = function () {
            console.debug('[TEST] onopen() called');
            okOpen = true;
          };
          vertxEventBus.reconnect();
          setTimeout(function () {
            expect(okClose).to.be(true);
            // Reconnect should be still false..
            expect(okOpen).to.be(false);
            setTimeout(function () {
              expect(okOpen).to.be(true);
              done();
            }, 2100);
            $timeout.flush();
          }, 100);
        }, 100);
      });
    });

    describe('after adding a handler via "registerHandler"', function () {
      it('should be called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data: JSON.stringify({
              address: 'xyz',
              body: {
                data: '1x'
              },
              replyAddress: undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.eql({data: '1x'});
          done();
        }, 200);
      });
    });

    describe('after adding and removing a handler via "registerHandler"', function () {
      it('should be not called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };
          var abcFunct = vertxEventBus.registerHandler('abc', abcHandler);
          var xyzFunct = vertxEventBus.registerHandler('xyz', xyzHandler);
          abcFunct();
          xyzFunct();
          SockJS.currentMockInstance.onmessage({
            data: JSON.stringify({
              address: 'xyz',
              body: {
                data: '1x'
              },
              replyAddress: undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be(undefined);
          done();
        }, 200);
      });
    });

    describe('after removing a registered handler via "unregisterHandler"', function () {
      it('should not be called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };
          vertxEventBus.registerHandler('abc', abcHandler);
          vertxEventBus.registerHandler('xyz', xyzHandler);
          // remove again!
          vertxEventBus.unregisterHandler('abc', abcHandler);
          vertxEventBus.unregisterHandler('xyz', xyzHandler);
          SockJS.currentMockInstance.onmessage({
            data: JSON.stringify({
              address: 'xyz',
              body: {
                data: '1x'
              },
              replyAddress: undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be(undefined);
          done();
        }, 200);
      });
    });

  });


  describe('vertxEventBusService', function () {

    var vertxEventBusService;

    beforeEach(inject(function (_vertxEventBusService_) {
      vertxEventBusService = _vertxEventBusService_;
    }));

    it('should be an object', function () {
      expect(typeof vertxEventBusService).to.be('object');
    });

    it('should have a method readyState()', function () {
      expect(vertxEventBusService.readyState).not.to.be(undefined);
    });

    describe('readyState()', function () {
      it('should be a function', function () {
        expect(typeof vertxEventBusService.readyState).to.be('function');
      });
    });

  });


  describe('vertxEventBusService', function () {

    describe(' with disabled message queue (default)', function () {
      var vertxEventBus, vertxEventBusService, result;

      beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
        vertxEventBusProvider.useMessageBuffer(0);
      }));

      beforeEach(inject(function (_vertxEventBus_, _vertxEventBusService_) {
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is closed
        _vertxEventBus_.readyState = function () {
          return _vertxEventBus_.EventBus.CLOSED;
        };
        var sendCalls = 0;
        _vertxEventBus_.send = function (address, message, replyHandler) {
          ++sendCalls;
          result = {
            reply: message
          };
          if (replyHandler) {
            replyHandler(result);
          }
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));

      describe('should not dispatch send', function () {
        it('when eventbus is closed', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data: 1});
            setTimeout(function () {
              expect(result).to.be(undefined);
              expect(vertxEventBusService.getBufferCount()).to.be(0);
              expect(vertxEventBus.getSendCalls()).to.be(0);
              done();
            }, 1000);
          }, 200);
        });
      });
    });

    describe(' with enabled message queue (size 3)', function () {
      var vertxEventBus, vertxEventBusService, result;

      beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
        vertxEventBusProvider.useMessageBuffer(3);
      }));

      beforeEach(inject(function (_vertxEventBus_, _vertxEventBusService_) {
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is closed
        vertxEventBus.readyState = function () {
          return vertxEventBus.EventBus.CLOSED;
        };
        var sendCalls = 0;
        vertxEventBus.send = function (address, message, replyHandler) {
          ++sendCalls;
          result = {
            reply: message
          };
          if (replyHandler) {
            replyHandler(result);
          }
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));

      describe('when eventbus is closed', function () {
        it('should dispatch send as queued', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data: 123});
            setTimeout(function () {
              expect(result).to.be(undefined);
              expect(vertxEventBusService.getBufferCount()).to.be(1);
              expect(vertxEventBus.getSendCalls()).to.be(0);
              done();
            }, 1000);
          }, 200);
        });

        it('should queue max 3 items', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data: 1});
            vertxEventBusService.send('xyz', {data: 2});
            vertxEventBusService.send('xyz', {data: 3});
            vertxEventBusService.send('xyz', {data: 4});
            setTimeout(function () {
              expect(result).to.be(undefined);
              expect(vertxEventBusService.getBufferCount()).to.be(3);
              expect(vertxEventBus.getSendCalls()).to.be(0);
              done();
            }, 1000);
          }, 200);
        });
      });

      describe('should replay queued items', function () {
        it('when eventbus is reopened', function (done) {
          setTimeout(function () {
            vertxEventBusService.send('xyz', {data: 0});
            vertxEventBusService.send('xyz', {data: 1});
            vertxEventBusService.send('xyz', {data: 2});
            vertxEventBusService.send('xyz', {data: 3});

            // fake connect
            vertxEventBus.readyState = function () {
              return vertxEventBus.EventBus.OPEN;
            };
            vertxEventBus.onopen();

            setTimeout(function () {
              expect(result).to.eql({reply: {data: 3}});
              expect(vertxEventBusService.getBufferCount()).to.be(0);
              expect(vertxEventBus.getSendCalls()).to.be(3);
              done();
            }, 1000);
          }, 200);
        });
      });
    });

    describe('should broadcast event', function () {
      var vertxEventBus, vertxEventBusService, $rootScope, $timeout, result;

      beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
        vertxEventBusProvider.useMessageBuffer(0);
      }));

      beforeEach(inject(function (_vertxEventBus_, _vertxEventBusService_, _$rootScope_, _$timeout_) {
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        vertxEventBus.readyState = function () {
          return vertxEventBus.EventBus.OPEN;
        };
      }));

      it('"system connected"', function (done) {
        $rootScope.$on('vertx-eventbus.system.connected', function () {
          result = true;
          done();
        });
        setTimeout(function () {
          expect(result).to.be(true);
        }, 1000);
      });

      it('"system login succeeded"', function (done) {
        var result;
        $rootScope.$on('vertx-eventbus.system.login.succeeded', function () {
          result = true;
          done();
        });
        setTimeout(function () {
          vertxEventBusService.login('username', 'password');
          setTimeout(function () {
            expect(result).to.be(true);
          }, 1000);
        }, 1000);
      });

      it('"system login failed"', function (done) {
        var result;
        SockJS.currentMockInstance.nextLoginState = false;
        $rootScope.$on('vertx-eventbus.system.login.failed', function () {
          result = true;
          SockJS.currentMockInstance.nextLoginState = true;
          done();
        });
        setTimeout(function () {
          vertxEventBusService.login('username', 'password');
          setTimeout(function () {
            expect(result).to.be(true);
          }, 1000);
        }, 1000);
      });
    });

    describe('should not send message', function () {
      var vertxEventBus, vertxEventBusService, $rootScope, $timeout, result;

      beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider, vertxEventBusServiceProvider) {
        vertxEventBusProvider.useMessageBuffer(0);
        vertxEventBusServiceProvider.requireLogin(true);
      }));

      beforeEach(inject(function (_vertxEventBus_, _vertxEventBusService_, _$rootScope_, _$timeout_) {
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        vertxEventBus.readyState = function () {
          return vertxEventBus.EventBus.OPEN;
        };
        vertxEventBus.send = function (address, message, replyHandler) {
          console.debug('XY', address, message, replyHandler);
          result = true;
        };
      }));

      it('when login is required', function (done) {
        setTimeout(function () {
          vertxEventBusService.send('xyz', 'blabla');
        }, 500);
        setTimeout(function () {
          // should not be true (because this would mean the message was sent)
          expect(result).to.be(undefined);
          done();
        }, 1000);
      });
    });

    describe('when the service is not connected', function () {
      var vertxEventBus, vertxEventBusService, $timeout;

      beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
        vertxEventBusProvider.useMessageBuffer(0);
      }));

      beforeEach(inject(function (_vertxEventBus_, _vertxEventBusService_, _$timeout_) {
        $timeout = _$timeout_;
        vertxEventBus = _vertxEventBus_;
        vertxEventBusService = _vertxEventBusService_;
        // Mock bus is closed
        _vertxEventBus_.readyState = function () {
          return _vertxEventBus_.EventBus.OPEN;
        };
        var sendCalls = 0;
        _vertxEventBus_.send = function () {
          // do nothing, let it timeout
        };
        // extend object
        vertxEventBus.getSendCalls = function () {
          return sendCalls;
        };
      }));

      describe('send() should call the error callback', function () {

        it('via promise.then()', function (done) {
          var successCalled, errorCalled;
          setTimeout(function () {
            // very short timeout: 10
            vertxEventBusService.send('xyz', {data: 1}, true, 10).then(function () {
              successCalled = true;
            }, function () {
              errorCalled = true;
            });
            setTimeout(function () {
              $timeout.flush();
              expect(successCalled).to.be(undefined);
              expect(errorCalled).to.be(true);
              done();
            }, 300);
          }, 200);
        });

        it('via promise.catch()', function (done) {
          var successCalled, errorCalled;
          setTimeout(function () {
            // very short timeout: 10
            vertxEventBusService.send('xyz', {data: 1}, 10).then(function () {
              successCalled = true;
            })['catch'](function () {
              errorCalled = true;
            });
            setTimeout(function () {
              $timeout.flush();
              expect(successCalled).to.be(undefined);
              expect(errorCalled).to.be(true);
              done();
            }, 300);
          }, 200);
        });

      });

    });


    describe('after adding and removing a handler via "registerHandler"', function () {

      var vertxEventBusService;

      beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
        vertxEventBusProvider.useMessageBuffer(0);
      }));

      beforeEach(inject(function (_vertxEventBusService_) {
        vertxEventBusService = _vertxEventBusService_;
      }));

      it('should not be called', function (done) {
        var abcCalled, xyzCalled;
        setTimeout(function () {
          var abcHandler = function (message) {
            abcCalled = message;
          }, xyzHandler = function (message) {
            xyzCalled = message;
          };

          var abcFunct = vertxEventBusService.addListener('abc', abcHandler);
          var xyzFunct = vertxEventBusService.addListener('xyz', xyzHandler);
          // remove again!
          abcFunct();
          xyzFunct();
          SockJS.currentMockInstance.onmessage({
            data: JSON.stringify({
              address: 'xyz',
              body: {
                data: '1x'
              },
              replyAddress: undefined
            })
          });
          expect(abcCalled).to.be(undefined);
          expect(xyzCalled).to.be(undefined);
          done();
        }, 200);
      });
    });

  });

  describe('after removing a registered handler via "unregisterHandler"', function () {

    var vertxEventBusService;

    beforeEach(module('knalli.angular-vertxbus', function (vertxEventBusProvider) {
        vertxEventBusProvider.useMessageBuffer(0);
      }));

    beforeEach(inject(function (_vertxEventBusService_) {
      vertxEventBusService = _vertxEventBusService_;
    }));

    it('should not be called', function (done) {
      var abcCalled, xyzCalled;
      setTimeout(function () {
        var abcHandler = function (message) {
          abcCalled = message;
        }, xyzHandler = function (message) {
          xyzCalled = message;
        };
        vertxEventBusService.addListener('abc', abcHandler);
        vertxEventBusService.addListener('xyz', xyzHandler);
        // remove again!
        vertxEventBusService.removeListener('abc', abcHandler);
        vertxEventBusService.removeListener('xyz', xyzHandler);
        SockJS.currentMockInstance.onmessage({
          data: JSON.stringify({
            address: 'xyz',
            body: {
              data: '1x'
            },
            replyAddress: undefined
          })
        });
        expect(abcCalled).to.be(undefined);
        expect(xyzCalled).to.be(undefined);
        done();
      }, 200);
    });

  });


});
