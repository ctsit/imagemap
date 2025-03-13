<?php
/** @var \ImageMap\ExternalModule\ExternalModule $module */

/**
 * Documentation page from action-tag help button
 */

require_once APP_PATH_DOCROOT . 'ProjectGeneral/header.php';
?>
<style>

    pre.code {font-size:smaller; }
    img.preview { max-width: 160px; }
    table.example {
        width: 100%;
        table-layout:fixed;
    }
    table.example tr th:first-child {
        width: 170px;
    }


    table.detail {
        width: 100%;
        table-layout:auto;
    }

    table.detail tr th:first-child {
        padding-right: 20px;
        width: 100px;
    }

    table.detail tr:nth-child(even) {background: #FAFAFF}
    table.detail tr:nth-child(odd) {background: #FFF}

    table.detail td {
        color: #666;
    }
    table.detail textarea {
        width: 100%;
        resize: unset;
    }
    span.copy {float:right;margin-right: -10px;}

    .example th { font-weight: bold; }

    div.long {display: inline-block; overflow-x: hidden; word-break: break-all; }

</style>

<h3>ImageMap Documentation</h3>

<p>
    ImageMap creates a clickable image to work with or replace a traditional REDCap input field.
</p>

<h4>What field types are supported?</h4>
<p>
    If the imagemap uses 'singleSelect' this means that only one region can be selected at a time. For this type of map, you should use a text or radio field. The benefit of using a radio field is that you could add custom labels to the selected value that would appear with piping or in exports with labels. You MUST make sure the enumerated values for your question matches the options defined by the imagemap.
</p>
<p>
    If, on the other hand, your map supports multi-select, then you can choose either a text or radio question type. Text is simpler, and multiple regions will be comma-separated in the input value. A checkbox allows you to do individual branching based upon selected regions. For example, you could have specific questions that apply if someone checks any head or neck region on the painmap.
</p>

<h4>Can you help me get started?</h4>
<p>
    The following instrument zip file contains a set of examples with different imagemap options. Simply download it and add it to your project from the online designer. You can remove the instrument at any time when you're done.
</p>
    <a href="<?php echo $module->getUrl("docs/all_maps_Instrument_Example.zip") ?>" target="_BLANK">
        <div class="button btn btn-primary">Download Example Instrument</div>
    </a>

<h4>What Maps Are There?</h4>
<table class="table table-bordered example">
    <tr>
        <th class="info">Image</th>
        <th class="info">Details</th>
    </tr>
    <?php
    foreach ($module->getImageMapParams() as $map => $detail) {
    ?>
        <tr>
            <td>
                <img class='preview' src='<?php echo $module->getUrl( $detail['image'] ) ?>' alt=""/>
            </td>
            <td>
                <table class='detail'>
                    <tr>
                        <th>Name:</th>      <th><?php echo $map ?></th>
                    </tr>
                    <tr>
                        <th>Desc:</th>      <td><?php echo $detail['desc'] ?></td>
                    </tr>
                    <tr>
                        <th>Keys:<span class='copy glyphicon glyphicon-copy' data-clipboard-target="#<?php echo $map ?>-keys"></span></th>
                        <td><div id="<?php echo $map ?>-keys" class='copy-target long'><?php echo $detail['options'] ?></div></td>
                    </tr>
                    <tr>
                        <th>Enums:<span class='copy glyphicon glyphicon-copy' data-clipboard-target="#<?php echo $map ?>-ta"></span></th>
                        <td><textarea id="<?php echo $map ?>-ta" class="copy-target"><?php echo implode("\n", array_map("trim", explode("|",$detail['data_dict_default']))) ?></textarea></td>
                    </tr>
                    <tr>
                        <th>Img Size:</th>
                        <td><?php echo $detail['width']."w x ".$detail['height']."h"?></td>
                    </tr>
                    <tr>
                        <th>Selection:</th>
                        <td><?php echo (!empty($detail['singleSelect']) && $detail['singleSelect'] ? "Single" : "Multiple") ?></td>
                    </tr>
                    <tr>
                        <th>Field type:</th>
                        <td>Text or <?php echo (!empty($detail['singleSelect']) && $detail['singleSelect'] ? "Radio" : "Checkbox") ?></td>
                    </tr>
                    <tr>
                        <th>Input:</th>
                        <td><?php echo (!empty($detail['hideInput']) && $detail['hideInput'] ? "Hidden" : "Visible") ?></td>
                    </tr>
                </table>
            </td>
        </tr>
    <?php
    }
    ?>
</table>

<h4>How can I make my own images?</h4>
<p>
    You must have a png image file AND create a html file containing <code>area</code> tags. An example area file is below:</p>
<pre class="code"><?php echo htmlspecialchars( file_get_contents($module->getModulePath() .'maps/smile_scale.html', false, null, 0, 200)) ?></pre>
<p>The value for the data-key attribute will be the value stored in REDCap - either as radio/checkbox keys or in a text box. Currently, you must submit these files to our git repo - in the future we may add the ability to insert those files into the External Module as parameters.
</p>

<script src="https://cdn.jsdelivr.net/npm/clipboard@1/dist/clipboard.min.js"></script>

<script>
    new Clipboard('.copy', {
        text: function() {
            const tr = $(this).parentsUntil('tr').parent();
            const target = $('.copy-target',tr);
            return target.text();
        }
    });
</script>
