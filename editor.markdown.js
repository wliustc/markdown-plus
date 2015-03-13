var editor;

$(document).ready(function() {

  // 构造上中右三个面板
  $('body').layout({
    resizerDblClickToggle: false,
    resizable: false,
    slidable: false,
    togglerLength_open: '100%',
    togglerLength_closed: '100%',
    north: {
      size: '1px', // 只是占位，真实大小由内容决定
      togglerTip_open: 'Hide Toolbar',
      togglerTip_closed: 'Show Toolbar'
    },
    east: {
      size: '50%',
      togglerTip_open: 'Hide Preview',
      togglerTip_closed: 'Show Preview',
      onresize: function() {
        editor.session.setUseWrapMode(false); // ACE的wrap貌似有问题，这里手动触发一下。
        editor.session.setUseWrapMode(true);
      }
    }
  });

  // 左侧编辑器
  editor = ace.edit("editor");
  editor.$blockScrolling = Infinity;
  editor.renderer.setShowPrintMargin(false);
  editor.session.setMode("ace/mode/markdown");
  editor.session.setUseWrapMode(true);
  editor.setFontSize('14px');
  editor.focus();

  // 设置marked
  var renderer = new marked.Renderer();
  renderer.listitem = function(text) {
    if(!/^\[[ x]\]\s/.test(text)) {
      return marked.Renderer.prototype.listitem(text);
    }
    // 任务列表
    var checkbox = $('<input type="checkbox" class="taskbox" disabled="disabled"/>');
    if(/^\[x\]\s/.test(text)) { // 完成的任务列表
      checkbox.attr('checked', true);
    }
    return $(marked.Renderer.prototype.listitem(text.substring(4))).addClass('none-style').prepend(checkbox)[0].outerHTML;
  }
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: true
  });

  // 实时监听用户的编辑
  editor.session.on('change', function() {
    $('.markdown-body').html(marked(editor.session.getValue())); // 实时预览
    $('pre').addClass('prettyprint').addClass('linenums');
    prettyPrint(); // 语法高亮
  });

  // h1 - h6 heading
  $('.heading-icon').click(function() {
    var level = $(this).data('level');
    var p = editor.getCursorPosition();
    p.column += level + 1; // 光标位置会产生偏移
    editor.navigateLineStart();
    editor.insert('#'.repeat(level) + ' ');
    editor.moveCursorToPosition(p); // 恢复光标位置
    editor.focus();
  });

  // styling icons
  $('.styling-icon').click(function() {
    var modifier = $(this).data('modifier');
    var range = editor.selection.getRange();
    if(range.isEmpty()) { // 没有选中任何东西
      range = editor.selection.getWordRange(range.start.row, range.start.column) // 当前单词的range
    }
    var p = editor.getCursorPosition();
    p.column += modifier.length; // 光标位置会产生偏移
    editor.session.replace(range, modifier + editor.session.getTextRange(range) + modifier);
    editor.moveCursorToPosition(p); // 恢复光标位置
    editor.selection.clearSelection(); // 不知为何上一个语句会选中一部分文字
    editor.focus();
  });

  // <hr/>
  $('#horizontal-rule').click(function() {
    var p = editor.getCursorPosition();
    if(p.column == 0) { // 光标在行首
      editor.insert('\n---\n');
    } else {
      editor.navigateLineEnd();
      editor.insert('\n\n---\n');
    }
    editor.focus();
  });

});