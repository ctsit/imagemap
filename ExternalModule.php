<?php
/**
 * @file
 * Provides ExternalModule class for Image Map.
 */

namespace ImageMap\ExternalModule;

use ExternalModules\AbstractExternalModule;
use Form;


/**
 * ExternalModule class for Image Map.
 */
class ExternalModule extends AbstractExternalModule {

    public $tag = "@IMAGEMAP";

    /**
     * @inheritdoc
     */
    function redcap_every_page_top($project_id) {

        // Handle online designer view
        if (PAGE == 'Design/online_designer.php' && $project_id) {
            $this->injectActionTagHelper();
        }
        // Handle Data Entry page
        else if (PAGE === 'DataEntry/index.php') {
            $this->injectImageMaps();
        }
        // Handle Survey pages
        else if (in_array(PAGE, ['surveys/index.php', 'Surveys/theme_view.php']) && !empty($_GET['id'])) {
            if (!isset($_GET['s']) && defined('NOAUTH')) {
                // Do not remember this use case
                return;
            }
            $this->injectImageMaps();
        }
    }

    private function injectImageMaps() {
        global $Proj;
        $settings = array();

        // Loop through action tags
        // This is a bit of a hack, but in surveys this value is set before the every_page_top hook is called
        $instrument = $_GET['page'];

        // check instrument exists in project.
        if(!array_key_exists($instrument, $Proj->forms)){
            return;
        }

        // TODO: Consider switching over to ActionTagHelper to support single-param overrides in imagemap
        // (such as hiding or showing the radio/checkboxes)

        // Check action-tags for this page
        foreach (array_keys($Proj->forms[$instrument]['fields']?:[]) as $field_name) {
            $field_info = $Proj->metadata[$field_name];

            if (!$imagemap_name = Form::getValueInActionTag($field_info['misc'], $this->tag)) {
                continue;
            }

            // load the imagemap
            $row = $this->getImageMapParams($imagemap_name);

            if (empty($row)) {
                // The specified imagemap is not defined
                \REDCap::logEvent("Missing ImageMap", "$imagemap_name is defined for field $field_name but does not exist.",
                    "", "", "", $this->getProjectId());
                continue;
            }

            // Add the imagemap to the settings
            $row['field'] = $field_name;
            $row['type'] = $field_info['element_type'];

            $dir = $this->getModulePath();
            $row['areas'] = file_get_contents($dir .  $row['map']);
            $row['src'] = "data:image/png;base64," . base64_encode(file_get_contents($dir . $row['image']));;

            $settings[] = $row;
        }

        if (empty($settings)) {
            return;
        }

        // Inject the javascript to the client
        $this->includeJs('js/imageMapster.js');

        // Inject the JSMO
        echo $this->initializeJavascriptModuleObject();
        $data = [
            "settings" => $settings,
            "enableConsoleLogs" => $this->getProjectSetting('enable-console-logs')
        ];
        $this->includeJs('js/jsmo.js');
        ?>
        <script>
            $(function() {
                const module = <?=$this->getJavascriptModuleObjectName()?>;
                module.data = <?=json_encode($data)?>;
                module.afterRender(module.start);
            })
        </script>
        <style>
            /* Hide the form so we don't see checkboxes being hidden during page render */
            #form {opacity: 0;}
        </style>
        <?php
    }


    private function injectActionTagHelper() {
        echo $this->initializeJavascriptModuleObject();
        $data = [
            "helpUrl" => $this->getUrl('documentation.php'),
            "maps" => $this->getImageMapParams()
        ];
        $this->includeJs('js/jsmo.js');
        ?>
        <script>
            $(function() {
                const module = <?=$this->getJavascriptModuleObjectName()?>;
                module.data = <?=json_encode($data)?>;
                module.afterRender(module.onlineDesignerStart);
            })
        </script>
        <style>
            span.imagemap {
                margin-right: 5px;
                overflow-wrap: normal;
                word-wrap: normal;
            }

            div.imagemap-container {
                overflow-wrap: normal;
                -ms-hyphens: auto;
                -moz-hyphens: auto;
                -webkit-hyphens: auto;
                hyphens: auto;
            }
        </style>
        <?php
    }


    /**
     * Includes a local JS file - uses the API endpoint if auth type is shib
     *
     * @param string $path
     *   The relative path to the js file.
     */
    protected function includeJs($path) {
        $use_api_urls = (bool) $this->getSystemSetting('use-api-urls');
        $ext_path = $this->getUrl($path, true, $use_api_urls);
        echo '<script src="' . $ext_path . '"></script>';
    }


    /**
     * Return the array of params for the specified imagemap (or all maps)
     *
     * @param $image_map
     * @return mixed
     */
    public function getImageMapParams($image_map = null) {

        //TODO: Support having custom-maps defined via the EM config
        $image_maps = $this->getConfig()['default-image-maps'];
        if ($image_map !== null && isset($image_maps[$image_map])) {
            return $image_maps[$image_map];
        } else {
            return $image_maps;
        }

    }
}
