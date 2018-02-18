jQuery( document ).ready( function ( $ ) {
   'use strict';
   const EMPTY = "empty";
   const $colorPicker   = $( "#colorPicker" );
   const $sizePicker    = $( "#sizePicker" );
   const $inputWidth    = $( "#input_width" );
   const $inputHeight   = $( "#input_height" );
   const $pixelCanvas   = $( "#pixel_canvas" );
   const $recentColors  = $( "#recent-colors" );
   const $canvasName    = $( "#canvas-name" );
   const $savedCanvases = $( "#saved-canvases" );

   let width = 0;
   let height = 0;
   let recentColors = [];
   let savedCanvases = [];

   function rgbToHex( rgb ) {
      rgb = rgb.match( /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i );
      return (rgb && rgb.length === 4) ? "#" +
         ("0" + parseInt( rgb[1], 10 ).toString( 16 )).slice( -2 ) +
         ("0" + parseInt( rgb[2], 10 ).toString( 16 )).slice( -2 ) +
         ("0" + parseInt( rgb[3], 10 ).toString( 16 )).slice( -2 ) : '';
   }

   function makeGrid( width, height ) {
      let grid = "";

      // can't use this, rubric calls for a while loop; saving
      // for future reference
      // if ($pixelCanvas.children().length) {
      //     $pixelCanvas.children().remove();
      // }

      // because, the rubric
      const table = document.getElementById( "pixel_canvas" );
      if ( table.firstChild ) {
         while ( table.firstChild ) {
            table.removeChild( table.firstChild );
         }
      }

      for ( let y = 0; y < height; y++ ) {
         // inserts y rows into the table
         const row = pixel_canvas.insertRow( y );
         for ( let x = 0; x < width; x++ ) {
            // inserts x cells into each of the rows
            const cell = row.insertCell( x );
            //cell.addEventListener( "click", function ( $ ) {
            //   fillBox( cell, color );
            //} );
         }
      }

      // avoid appending elements within a loop per
      // https://learn.jquery.com/performance/append-outside-loop/
      //grid = "<tbody>\n";
      //for ( let row = 0; row < height; row++ ) {
      //   grid += "\t<tr>\n";
      //   for ( let col = 0; col < width; col++ ) {
      //      grid += "\t\t<td></td>\n";
      //   }
      //   grid += "\t</tr>\n";
      //}
      //
      //grid += "</tbody>";
      //$pixelCanvas.append( grid );

      //console.log( $pixelCanvas );
   }

   function processCanvas( callback, data ) {

      $pixelCanvas.find( "tr" ).each( function ( row, rElem ) {
         $( rElem ).find( "td" ).each( function ( col, cElem ) {
            if ( typeof callback === "function" ) {
               callback( cElem, data, row, col );
            }
         } );
      } );
   }

   function eraseGrid( elem ) {
      $( elem ).css( { "background-color": "" } );
   }

   function saveGrid( elem, data ) {
      const $elem = $( elem );
      let cellVal = "";

      if ( $elem.attr( "style" ) ) {
         cellVal = rgbToHex( $elem.css( "background-color" ) );
      } else { // bg color is undefined
         cellVal = EMPTY;
      }

      data.push( cellVal );

   }

   function loadGrid( elem, data, row, col ) {
      let idx = (row * Math.max( width, height )) + col; // treat 1D array as 2D

      if ( data[idx] !== EMPTY ) {
         $( elem ).css( { "background-color": data[idx] } );
      } else {
         $( elem ).css( { "background-color": "" } );
      }
   }

   function addRecentColor( colorVal ) {
      // let colorVal = $(this).val(); // used for debouncing with no param

      if ( recentColors.length === 0 ) {
         $recentColors.find( ".empty-message" ).remove();
      }

      // if it's a color that hasn't been picked before, save it
      if ( recentColors.indexOf( colorVal ) === -1 ) {
         recentColors.push( colorVal );
         $( '<div class="color"></div>' ).appendTo( $recentColors ).css( "background-color", colorVal );
      }
   }

   function removeRecentColor( $target, colorVal ) {
      if ( !colorVal ) { // remove all
         $recentColors.find( ".color" ).remove();
         recentColors = [];
      } else { // remove single color
         const idx = recentColors.indexOf( colorVal );
         if ( idx > -1 ) {
            $target.remove();
            recentColors.splice( idx, 1 );
         }
      }

      // prevent appending multiple empty messages if "Remove all" is clicked
      // and the empty message already exists
      if ( $recentColors.children( ".empty-message" ).length === 0 && recentColors.length === 0 ) {
         $( '<p class="empty-message">No recent colors used</p>' ).appendTo( $recentColors );
      }

   }

   function addSavedCanvas( data ) {
      let saveAs = $canvasName.val();
      let canvasId = savedCanvases.length;
      let formTemp = `<div class="form-group">
                         <label for="${canvasId}">${saveAs}</label>
                         <input type="submit" name="${canvasId}" id="${canvasId}" 
                         value="Load" class="waves-effect waves-light btn" >
                    </div>`;

      if ( savedCanvases.length === 0 ) {
         $savedCanvases.find( ".empty-message" ).remove();
      }

      savedCanvases[canvasId] = data;
      $savedCanvases.append( formTemp );
   }

   function removeSavedCanvases() {
      $savedCanvases.find( ".form-group" ).remove();
      savedCanvases = [];

      // prevent appending multiple empty messages if "Remove all" is clicked
      // and the empty message already exists
      if ( $savedCanvases.children( ".empty-message" ).length === 0 && savedCanvases.length === 0 ) {
         $( '<p class="empty-message">No saved canvases</p>' ).appendTo( $savedCanvases );
      }

   }

   $sizePicker.submit( function ( event ) {
      event.preventDefault();
      width = $inputWidth.val();
      height = $inputHeight.val();
      removeRecentColor();
      removeSavedCanvases();
      makeGrid( width, height );
   } );

// avoid binding event handlers to each grid element,
// use event delegation instead
   $pixelCanvas.on( "click", "td", function ( event ) {
      let $target = $( event.target );
      let color = $colorPicker.val();

      if ( event.altKey ) {
         if ( $target.attr( "style" ) ) { // make sure there's a background-color
            $colorPicker.val( rgbToHex( $target.css( "background-color" ) ) );
         }
         return;
      }

      if ( event.shiftKey ) {
         $target.css( { "background-color": "" } );
      } else {
         $target.css( { "background-color": color } );
         addRecentColor( color );
      }
   } );

// allow dragging to paint:
//     mouseout captures the element that was under the cursor when mousedown event was triggered,
//     otherwise it's missed
   $( document ).mousedown( function ( event ) {
      // disable shift + click functionality of the browser to prevent highlighting/selecting
      // all text while shift + clicking to remove colors
      // check the shift key is pressed to prevent not being able to select text boxes
      // when you're not shift + clicking
      // see: https://stackoverflow.com/questions/1527751/disable-text-selection-while-pressing-shift
      if ( event.shiftKey ) {
         event.preventDefault();
      }

      $pixelCanvas.on( "mouseover mouseout", "td", function ( event ) {
         if ( event.shiftKey ) {
            $( this ).css( { "background-color": "" } );
         } else {
            $( this ).css( { "background-color": $colorPicker.val() } );
            addRecentColor( $colorPicker.val() );
         }
      } );
   } ).mouseup( function () {
      $pixelCanvas.off( "mouseover mouseout" );
   } );

   /*
       SAVING DEBOUNCING FOR REFERENCE: lots of colors were being added to Recent Colors with
       this implementation, opting to only add Recent Colors that were used on the grid rather than
       trying to save colors on $colorPicker input change
   */
// // taken from https://github.com/jashkenas/underscore/blob/master/underscore.js#L883
// function debounce(func, wait, immediate) {
//     var timeout;
//     return function() {
//         var context = this, args = arguments;
//         var later = function() {
//             timeout = null;
//             if (!immediate) func.apply(context, args);
//         };
//         var callNow = immediate && !timeout;
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//         if (callNow) func.apply(context, args);
//     };
// }
//
// // debounce to avoid multiple fired events when user drags across the color picker
// $colorPicker.on("change", debounce(addRecentColor, 700) );

   $recentColors.on( "click", "div", function ( event ) {
      let $this = $( this );
      let color = rgbToHex( $this.css( "background-color" ) );

      if ( event.shiftKey ) {
         removeRecentColor( $this, color );
      } else {
         $colorPicker.val( color );
      }
   } );

   $( "#recent-color-remove" ).on( "click", function ( event ) {
      event.preventDefault();
      removeRecentColor();
   } );

   $( "#canvas-form" ).on( "click", function ( event ) {

      event.preventDefault();
      let mode = $( event.target ).val().toLowerCase();
      if ( mode === "erase" ) {
         processCanvas( eraseGrid );
      } else if ( mode === "save" ) {
         let tableVals = [];

         if ( $canvasName.val().length === 0 ) {
            alert( "Please enter a canvas name." );
            return;
         }

         processCanvas( saveGrid, tableVals );
         addSavedCanvas( tableVals );
      }

   } );

   $savedCanvases.on( "click", "input", function ( event ) {
      event.preventDefault();
      let canvasId = $( event.target ).attr( "id" );
      processCanvas( loadGrid, savedCanvases[canvasId] );
   } );

   $( "#remove-saved-canvases" ).on( "click", function ( event ) {
      event.preventDefault();
      removeSavedCanvases();
   } );


   $( document ).ready( function () {
      $sizePicker.trigger( "submit" );
   } );

   /* repeatString() returns a string which has been repeated a set number of times */
   function repeatString(str, num) {
      out = '';
      for (var i = 0; i < num; i++) {
         out += str;
      }
      return out;
   }

   /**
    * PHP-like print_r() equivalent for JavaScript Object
    *
    * @author Faisalman <fyzlman@gmail.com>
    * @license http://www.opensource.org/licenses/mit-license.php
    * @link http://gist.github.com/879208
    */
   var print_r = function (obj, t) {

      // define tab spacing
      var tab = t || '';

      // check if it's array
      var isArr = Object.prototype.toString.call(obj) === '[object Array]';

      // use {} for object, [] for array
      var str = isArr ? ('Array\n' + tab + '[\n') : ('Object\n' + tab + '{\n');

      // walk through it's properties
      for (var prop in obj) {
         if (obj.hasOwnProperty(prop)) {
            var val1 = obj[prop];
            var val2 = '';
            var type = Object.prototype.toString.call(val1);
            switch (type) {

               // recursive if object/array
               case '[object Array]':
               case '[object Object]':
                  val2 = print_r(val1, (tab + '\t'));
                  break;

               case '[object String]':
                  val2 = '\'' + val1 + '\'';
                  break;

               default:
                  val2 = val1;
            }
            str += tab + '\t' + prop + ' => ' + val2 + ',\n';
         }
      }

      // remove extra comma for last property
      str = str.substring(0, str.length - 2) + '\n' + tab;

      return isArr ? (str + ']') : (str + '}');
   };
} );
