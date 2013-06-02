<?php 


try {
    $bp = ORM::for_table('axc_machines')->find_one($this->values['identifier']);
    if ($bp) {
        if($this->values['running'] != null ){
           $bp->set('running',$this->values['running']);
        }
        if($this->values['destroyed'] != null ){
           $bp->set('destroyed',$this->values['destroyed']);
        }
        $bp->save();
    } else {
        throw new Exception('no object with id ' . $this->values['identifier']);
    }
    ZU::header(202);

} catch (Exception $e) {
    ZU::header(404);

    $this->data['message'] = $e->getMessage() ;
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
        $xml = Array2XML::createXML('machines', $this->data);
        $this->contentbuffer = $xml->saveXML();
        break;
}