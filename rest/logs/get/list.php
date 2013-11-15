<?php
/** @var $this ZUFEATURE */
/** @var $REST ZUREST */

try {

    $logs = ORM::for_table('log')->table_alias('l');

    $this->REST_scope($logs);
    $count = clone($logs);

    $this->REST_fields($logs);
    $this->REST_sortorder($logs);

    $logs_array = $logs->page($this->values['page'], $this->values['limit'])->find_array();

    if ($logs_array) {
        $this->REST_clean_types($logs_array);
        $this->data['metadata'] = $this->REST_pagination($count->count(), count($logs_array));
        $this->data['data'] = format_dates($logs_array);
    } else {
        throw new Exception('no data');
    }

} catch (Exception $e) {
    ZU::header(204);
    $this->data['message'] = $e->getMessage();
}

// set default mimetype
if (!$this->mimetype) {
    $this->mimetype = 'json';
}

switch ($this->mimetype) {
    case "json":
        header('Content-type: application/json');
        $this->contentbuffer = json_encode($this->data);
        break;
    case "xml":
        header('Content-type: application/xml');
        ZU::load_class('lalit.array2xml', 'xml', true);
        $xml = Array2XML::createXML('blueprints', $this->data);
        $this->contentbuffer = $xml->saveXML();
        break;
}